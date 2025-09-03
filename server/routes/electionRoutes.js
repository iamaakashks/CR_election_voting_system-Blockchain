const express = require('express');
const router = express.Router();
const { getMySectionElections, createElection, addCandidateToElection, castVote } = require('../controllers/electionController');
const { protect, admin } = require('../middleware/authMiddleware');

// Student Routes
router.get('/my-section', protect, getMySectionElections);
router.post('/:electionId/vote', protect, castVote); // <-- NEW VOTE ROUTE

// Admin Routes
router.post('/', protect, admin, createElection);
router.post('/:id/candidates', protect, admin, addCandidateToElection);

module.exports = router;