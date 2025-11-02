const { ethers } = require('ethers');
const Election = require('../models/Election');
const User = require('../models/User');
const contractABI = require('../config/VeriVote.json').abi;

// --- Helper for WRITING to the blockchain (costs gas) ---
const getWriteContract = () => {
    const provider = new ethers.JsonRpcProvider(process.env.GANACHE_RPC_URL);
    // Uses your Admin Wallet to sign transactions
    const signer = new ethers.Wallet(process.env.SERVER_WALLET_PRIVATE_KEY, provider);
    return new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, signer);
};

// --- NEW Helper for READING from the blockchain (free) ---
const getReadOnlyContract = () => {
    const provider = new ethers.JsonRpcProvider(process.env.GANACHE_RPC_URL);
    // Does not need a private key, just a public connection
    return new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, provider);
};

// Converts a string (like a MongoDB ObjectId) to bytes32 format
const toBytes32 = (text) => {
    const textBytes = ethers.toUtf8Bytes(text);
    if (textBytes.length > 31) return ethers.keccak256(textBytes);
    return ethers.hexlify(ethers.zeroPadValue(ethers.toUtf8Bytes(text), 32));
};

// --- Admin Functions ---

const getAllElections = async (req, res) => {
    try {
        const elections = await Election.find({}).sort({ createdAt: -1 });
        res.json(elections);
    } catch (error) { res.status(500).json({ message: 'Server Error', error: error.message }); }
};

const getElectionById = async (req, res) => {
    try {
        let election = await Election.findById(req.params.id).populate('candidates.user', 'name collegeId');
        if (!election) return res.status(404).json({ message: 'Election not found' });
        if (election.status === 'Active' && new Date() > new Date(election.endTime)) {
            election.status = 'Completed';
            await election.save();
            election = await Election.findById(req.params.id).populate('candidates.user', 'name collegeId');
        }
        res.json(election);
    } catch (error) { res.status(500).json({ message: 'Server Error', error: error.message }); }
};

const createElection = async (req, res) => {
    try {
        const { title, department, section } = req.body;
        const election = new Election({ title, department, section, status: 'Pending' });
        const createdElection = await election.save();
        res.status(201).json(createdElection);
    } catch (error) { res.status(500).json({ message: 'Server Error', error: error.message }); }
};

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
    } catch (error) { res.status(500).json({ message: 'Server Error', error: error.message }); }
};

const startElection = async (req, res) => {
    try {
        const election = await Election.findById(req.params.id);
        if (!election) return res.status(404).json({ message: 'Election not found' });
        if (election.status !== 'Pending') return res.status(400).json({ message: 'This election is not in a Pending state.' });
        if (election.candidates.length < 2 || election.candidates.length > 3) return res.status(400).json({ message: 'Election must have 2 or 3 candidates.' });

        const contract = getWriteContract(); // Use the writing contract
        const electionIdBytes32 = toBytes32(election._id.toString());
        console.log(`Registering election ${election._id} on blockchain...`);
        const createTx = await contract.createElection(electionIdBytes32, election.candidates.length);
        await createTx.wait();
        console.log(`Activating election ${election._id} on blockchain...`);
        const toggleTx = await contract.toggleElectionState(electionIdBytes32, true);
        await toggleTx.wait();
        console.log('Blockchain state updated successfully.');

        election.status = 'Active';
        election.startTime = new Date();
        election.endTime = new Date(Date.now() + 15 * 60 * 1000);
        const updatedElection = await election.save();
        res.json(updatedElection);
    } catch (error) {
        console.error('CRITICAL ERROR STARTING ELECTION:', error);
        res.status(500).json({ message: 'Blockchain transaction failed. Please check server logs.', error: error.message });
    }
};

// --- Student Functions ---

const getMySectionElections = async (req, res) => {
    try {
        const { department, section } = req.user;
        if (!department || !section) return res.status(400).json({ message: 'User is not assigned to a department or section.' });
        const elections = await Election.find({ department, section }).populate('candidates.user', 'name collegeId');
        res.json(elections);
    } catch (error) { res.status(500).json({ message: 'Server Error', error: error.message }); }
};

const stopElection = async (req, res) => {
    try {
        const election = await Election.findById(req.params.id);
        if (!election) return res.status(404).json({ message: 'Election not found' });
        if (election.status !== 'Active') return res.status(400).json({ message: 'This election is not currently active.' });

        // --- Blockchain Transaction: Deactivate the election on-chain ---
        const contract = getWriteContract();
        const electionIdBytes32 = toBytes32(election._id.toString());
        console.log(`Deactivating election ${election._id} on blockchain...`);
        const toggleTx = await contract.toggleElectionState(electionIdBytes32, false);
        await toggleTx.wait();
        console.log('Blockchain state updated successfully (deactivated).');

        // --- Database Update: Mark as completed ---
        election.status = 'Completed';
        election.endTime = new Date(); // Set the end time to now
        const updatedElection = await election.save();
        res.json(updatedElection);

    } catch (error) {
        console.error('CRITICAL ERROR STOPPING ELECTION:', error);
        res.status(500).json({ message: 'Blockchain transaction failed. Please check server logs.', error: error.message });
    }
};

const castVote = async (req, res) => {
    try {
        const { candidateId } = req.body;
        const { electionId } = req.params;
        const voterId = req.user._id;
        const election = await Election.findById(electionId);
        if (!election) return res.status(404).json({ message: 'Election not found.' });
        if (election.status !== 'Active') return res.status(400).json({ message: 'This election is not active.' });
        if (election.voted.some(id => id.toString() === voterId.toString())) return res.status(400).json({ message: 'You have already voted in this election.' });
        const candidate = election.candidates.id(candidateId);
        if (!candidate) return res.status(404).json({ message: 'Candidate not found in this election.' });

        const candidateIndex = election.candidates.findIndex(c => c._id.toString() === candidateId);
        const contractCandidateId = candidateIndex + 1;
        const electionIdBytes32 = toBytes32(electionId);
        const voterIdBytes32 = toBytes32(voterId.toString());

        const contract = getWriteContract(); // Use the writing contract
        console.log(`Submitting vote for voter ${voterId} to blockchain...`);
        const tx = await contract.vote(electionIdBytes32, contractCandidateId, voterIdBytes32);
        await tx.wait();
        console.log('Blockchain vote successful.');

        candidate.votes += 1;
        election.voted.push(voterId);
        await election.save();
        res.status(200).json({ message: 'Vote successfully recorded on the blockchain!' });
    } catch (error) {
        console.error('CRITICAL ERROR CASTING VOTE:', error);
        res.status(500).json({ message: 'Blockchain transaction failed. Please check server logs.', error: error.message });
    }
};

// --- Public & Results Functions ---

const getElectionResults = async (req, res) => {
    try {
        const election = await Election.findById(req.params.id).populate('candidates.user', 'name collegeId');
        if (!election) return res.status(404).json({ message: 'Election not found' });
        if (election.status !== 'Completed') return res.status(400).json({ message: 'Election is not yet completed.' });
        
        // --- THIS IS THE FIX ---
        // Use the new, read-only contract for fetching data
        const contract = getReadOnlyContract(); 
        const electionIdBytes32 = toBytes32(election._id.toString());
        const blockchainResults = [];
        for (let i = 0; i < election.candidates.length; i++) {
            const contractCandidateId = i + 1;
            // This call will now use the simple provider, not the signer
            const voteCount = await contract.getVoteCount(electionIdBytes32, contractCandidateId);
            blockchainResults.push({
                id: election.candidates[i].user._id,
                name: election.candidates[i].user.name,
                votes: Number(voteCount)
            });
        }
        res.json({ electionDetails: election, blockchainResults });
    } catch (error) {
        console.error('CRITICAL ERROR FETCHING RESULTS:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

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
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

module.exports = {
    getAllElections,
    getElectionById,
    createElection,
    addCandidateToElection,
    startElection,
    stopElection,
    getMySectionElections,
    castVote,
    getElectionResults,
    getLatestWinner,
};