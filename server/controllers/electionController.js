const { ethers } = require('ethers');
const Election = require('../models/Election');
const User = require('../models/User');
const contractABI = require('../config/Election.json').abi; // Import the ABI

// --- Blockchain Interaction Logic ---
const castVoteOnBlockchain = async (candidateId) => {
    try {
        const provider = new ethers.JsonRpcProvider(process.env.GANACHE_RPC_URL);
        const signer = new ethers.Wallet(process.env.SERVER_WALLET_PRIVATE_KEY, provider);
        const electionContract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, signer);

        console.log(`Submitting vote for candidate ${candidateId} to the blockchain...`);
        const tx = await electionContract.vote(candidateId);
        await tx.wait();

        console.log('Vote successfully recorded on the blockchain!');
        console.log('Transaction Hash:', tx.hash);
        return true;
    } catch (error) {
        console.error('Blockchain transaction failed:', error.message);
        return false;
    }
};

// @desc    Create a new election
// @route   POST /api/elections
// @access  Private (Admins only)
const createElection = async (req, res) => {
    try {
        const { title, department, section, startTime, endTime } = req.body;
        const election = new Election({ title, department, section, startTime, endTime, status: 'Pending' });
        const createdElection = await election.save();
        res.status(201).json(createdElection);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Add a candidate to an election
// @route   POST /api/elections/:id/candidates
// @access  Private (Admins only)
const addCandidateToElection = async (req, res) => {
    try {
        const { userId } = req.body;
        const election = await Election.findById(req.params.id);
        const candidateUser = await User.findById(userId);
        if (!election || !candidateUser) return res.status(404).json({ message: 'Election or User not found.' });
        const isAlreadyCandidate = election.candidates.some(c => c.user.toString() === userId);
        if (isAlreadyCandidate) return res.status(400).json({ message: 'User is already a candidate.' });
        election.candidates.push({ user: userId });
        await election.save();
        res.status(200).json(election);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Cast a vote in an election
// @route   POST /api/elections/:electionId/vote
// @access  Private (Students)
const castVote = async (req, res) => {
    try {
        const { candidateId } = req.body;
        const { electionId } = req.params;
        const voterId = req.user._id;
        const election = await Election.findById(electionId);
        if (!election) return res.status(404).json({ message: 'Election not found.' });
        const hasAlreadyVoted = election.voted.some(id => id.toString() === voterId.toString());
        if (hasAlreadyVoted) return res.status(400).json({ message: 'You have already voted in this election.' });
        const candidate = election.candidates.id(candidateId);
        if (!candidate) return res.status(404).json({ message: 'Candidate not found in this election.' });
        const candidateIndex = election.candidates.findIndex(c => c._id.toString() === candidateId);
        const contractCandidateId = candidateIndex + 1;
        const success = await castVoteOnBlockchain(contractCandidateId);
        if (!success) return res.status(500).json({ message: 'Failed to record vote on the blockchain.' });
        candidate.votes += 1;
        election.voted.push(voterId);
        await election.save();
        res.status(200).json({ message: 'Your vote has been cast successfully on the blockchain!' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get all elections for the logged-in user's section
// @route   GET /api/elections/my-section
// @access  Private (Students)
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

module.exports = {
    createElection,
    addCandidateToElection,
    castVote,
    getMySectionElections,
};