const { ethers } = require('ethers');
const Election = require('../models/Election');
const User = require('../models/User');
// This imports the "instruction manual" for our final VeriVote smart contract.
const contractABI = require('../config/VeriVote.json').abi;

// --- HELPER FUNCTIONS ---

/**
 * Creates a connection to the blockchain.
 * This is our single entry point for all blockchain communications.
 */
const getContract = () => {
    const provider = new ethers.JsonRpcProvider(process.env.GANACHE_RPC_URL);
    // The server uses the Master Admin Wallet (from Ganache Account #1) to have admin privileges.
    const signer = new ethers.Wallet(process.env.SERVER_WALLET_PRIVATE_KEY, provider);
    return new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, signer);
};

/**
 * Converts a standard string (like a MongoDB ID) into a bytes32 format
 * that our Solidity smart contract can understand.
 */
const toBytes32 = (text) => {
    const textBytes = ethers.toUtf8Bytes(text);
    if (textBytes.length > 31) {
        return ethers.keccak256(textBytes); // Fallback for safety
    }
    return ethers.hexlify(ethers.zeroPadValue(ethers.toUtf8Bytes(text), 32));
};

// --- ADMIN-ONLY FUNCTIONS ---

/**
 * @desc    Get ALL elections for the main admin dashboard.
 * @route   GET /api/elections
 */
const getAllElections = async (req, res) => {
    try {
        const elections = await Election.find({}).sort({ createdAt: -1 });
        res.json(elections);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

/**
 * @desc    Get a single election's details for the "Manage" page.
 * Includes logic to automatically mark an election as "Completed" if its timer has run out.
 * @route   GET /api/elections/:id
 */
const getElectionById = async (req, res) => {
    try {
        let election = await Election.findById(req.params.id).populate('candidates.user', 'name collegeId');
        if (!election) return res.status(404).json({ message: 'Election not found' });

        // Auto-completion logic
        if (election.status === 'Active' && new Date() > new Date(election.endTime)) {
            election.status = 'Completed';
            await election.save();
            // Re-fetch to ensure data is fresh after update
            election = await Election.findById(req.params.id).populate('candidates.user', 'name collegeId');
        }
        res.json(election);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

/**
 * @desc    Step 1: Admin creates an election. This only saves it to our fast MongoDB database.
 * @route   POST /api/elections
 */
const createElection = async (req, res) => {
    try {
        const { title, department, section } = req.body;
        const election = new Election({ title, department, section, status: 'Pending' });
        const createdElection = await election.save();
        res.status(201).json(createdElection);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

/**
 * @desc    Step 2: Admin adds candidates to the election in the database.
 * @route   POST /api/elections/:id/candidates
 */
const addCandidateToElection = async (req, res) => {
    try {
        const { userId } = req.body;
        const election = await Election.findById(req.params.id);
        if (!election) return res.status(404).json({ message: 'Election not found.' });
        const candidateUser = await User.findById(userId);
        if (!candidateUser) return res.status(404).json({ message: 'Candidate user not found.' });
        if (election.candidates.some(c => c.user.toString() === userId)) return res.status(400).json({ message: 'User is already a candidate.' });
        election.candidates.push({ user: userId });
        await election.save();
        res.status(200).json(election);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

/**
 * @desc    Step 3: Admin starts the election. This is the first time we interact with the blockchain for this election.
 * @route   PUT /api/elections/:id/start
 */
const startElection = async (req, res) => {
    try {
        const election = await Election.findById(req.params.id);
        if (!election) return res.status(404).json({ message: 'Election not found' });
        if (election.status !== 'Pending') return res.status(400).json({ message: 'This election is not in a Pending state.' });
        if (election.candidates.length < 2 || election.candidates.length > 3) return res.status(400).json({ message: 'Election must have 2 or 3 candidates.' });

        // --- Blockchain Transaction #1: Register the election on-chain ---
        const contract = getContract();
        const electionIdBytes32 = toBytes32(election._id.toString());
        console.log(`Registering election ${election._id} on blockchain...`);
        const createTx = await contract.createElection(electionIdBytes32, election.candidates.length);
        await createTx.wait(); // Wait for the transaction to be confirmed

        // --- Blockchain Transaction #2: Activate voting for this election ---
        console.log(`Activating election ${election._id} on blockchain...`);
        const toggleTx = await contract.toggleElectionState(electionIdBytes32, true);
        await toggleTx.wait();
        console.log('Blockchain state updated successfully.');

        // --- Database Update: Start the timer and set status to Active ---
        election.status = 'Active';
        election.startTime = new Date();
        election.endTime = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        const updatedElection = await election.save();
        res.json(updatedElection);

    } catch (error) {
        console.error('Error starting election:', error);
        res.status(500).json({ message: 'Blockchain transaction failed. Please check server logs.', error: error.message });
    }
};

/**
 * @desc    Get final verified results for a completed election.
 * @route   GET /api/elections/:id/results
 */
const getElectionResults = async (req, res) => {
    try {
        const election = await Election.findById(req.params.id).populate('candidates.user', 'name collegeId');
        if (!election) return res.status(404).json({ message: 'Election not found' });
        if (election.status !== 'Completed') return res.status(400).json({ message: 'Election is not yet completed.' });
        
        // --- Fetch results directly from the blockchain for verification ---
        const contract = getContract();
        const electionIdBytes32 = toBytes32(election._id.toString());
        const blockchainResults = [];
        for (let i = 0; i < election.candidates.length; i++) {
            const contractCandidateId = i + 1;
            const voteCount = await contract.getVoteCount(electionIdBytes32, contractCandidateId);
            blockchainResults.push({
                id: election.candidates[i].user._id,
                name: election.candidates[i].user.name,
                votes: Number(voteCount)
            });
        }
        res.json({ electionDetails: election, blockchainResults });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};


// --- STUDENT-ONLY FUNCTIONS ---

/**
 * @desc    Get elections visible to the logged-in student.
 * @route   GET /api/elections/my-section
 */
const getMySectionElections = async (req, res) => {
    try {
        const { department, section } = req.user;
        if (!department || !section) return res.status(400).json({ message: 'User is not assigned to a department or section.' });
        const elections = await Election.find({ department, section }).populate('candidates.user', 'name collegeId');
        res.json(elections);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

/**
 * @desc    Student casts a vote. This sends a transaction to the blockchain.
 * @route   POST /api/elections/:electionId/vote
 */
const castVote = async (req, res) => {
    try {
        const { candidateId } = req.body; // This is the candidate's sub-document ID from MongoDB
        const { electionId } = req.params;
        const voterId = req.user._id; // The unique MongoDB ID of the student voting

        const election = await Election.findById(electionId);
        if (!election) return res.status(404).json({ message: 'Election not found.' });
        if (election.status !== 'Active') return res.status(400).json({ message: 'This election is not active.' });
        if (election.voted.some(id => id.toString() === voterId.toString())) return res.status(400).json({ message: 'You have already voted in this election.' });
        const candidate = election.candidates.id(candidateId);
        if (!candidate) return res.status(404).json({ message: 'Candidate not found in this election.' });

        // --- Blockchain Interaction ---
        const candidateIndex = election.candidates.findIndex(c => c._id.toString() === candidateId);
        const contractCandidateId = candidateIndex + 1; // Solidity uses 1-based index (1, 2, or 3)
        const electionIdBytes32 = toBytes32(electionId);
        const voterIdBytes32 = toBytes32(voterId.toString()); // Pass the student's unique ID

        const contract = getContract();
        console.log(`Submitting vote for voter ${voterId} to blockchain...`);
        const tx = await contract.vote(electionIdBytes32, contractCandidateId, voterIdBytes32);
        await tx.wait();
        console.log('Blockchain vote successful.');

        // --- Update our database as a cache for quick lookups ---
        candidate.votes += 1;
        election.voted.push(voterId);
        await election.save();
        res.status(200).json({ message: 'Vote successfully recorded on the blockchain!' });
    } catch (error) {
        console.error('Error casting vote:', error);
        res.status(500).json({ message: 'Blockchain transaction failed. Please check server logs.', error: error.message });
    }
};


// --- PUBLIC FUNCTIONS ---

/**
 * @desc    Get the winner of the most recent election for the public landing page.
 * @route   GET /api/elections/latest-winner
 */
const getLatestWinner = async (req, res) => {
    try {
        const latestCompletedElection = await Election.findOne({ status: 'Completed' }).sort({ endTime: -1 }).populate('candidates.user', 'name');
        if (!latestCompletedElection || latestCompletedElection.candidates.length === 0) return res.json({ message: 'No completed elections found.' });
        const winner = latestCompletedElection.candidates.reduce((prev, current) => (prev.votes > current.votes) ? prev : current);
        res.json({
            electionTitle: latestCompletedElection.title,
            department: latestCompletedElection.department,
            section: latestCompletedElection.section,
            winnerName: winner.user.name,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};


module.exports = {
    getAllElections,
    getElectionById,
    createElection,
    addCandidateToElection,
    startElection,
    getMySectionElections,
    castVote,
    getElectionResults,
    getLatestWinner,
};