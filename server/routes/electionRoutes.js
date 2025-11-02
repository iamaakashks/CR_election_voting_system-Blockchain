const express = require('express');
const router = express.Router();
const { getMySectionElections, createElection, addCandidateToElection, castVote, getAllElections, startElection, stopElection, getElectionById, getElectionResults, getLatestWinner } = require('../controllers/electionController');
const { protect, admin } = require('../middleware/authMiddleware');

// Student Routes
router.get('/', protect, admin, getAllElections);
router.get('/my-section', protect, getMySectionElections);
router.post('/:electionId/vote', protect, castVote); // <-- NEW VOTE ROUTE
router.put('/:id/start', protect, admin, startElection);
router.route('/:id/stop').put(protect, admin, stopElection); // <-- ADD THIS NEW ROUTE
router.get('/latest-winner', getLatestWinner);
// Admin Routes
router.post('/', protect, admin, createElection);
router.post('/:id/candidates', protect, admin, addCandidateToElection);
router.get('/:id', protect, admin, getElectionById); // Add this new route
router.get('/:id/results', protect, admin, getElectionResults); 

module.exports = router;