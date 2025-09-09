// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "hardhat/console.sol";

contract VeriVote {
    address public contractAdmin;

    struct Election {
        bool exists;
        bool isActive;
        uint8 candidatesCount;
        mapping(uint8 => uint256) votes;
        // This mapping now tracks voters by their unique ID, not their address
        mapping(bytes32 => bool) hasVoted; 
    }

    mapping(bytes32 => Election) public elections;

    event Voted(bytes32 indexed electionId, uint8 indexed candidateId, bytes32 voterId);

    constructor() {
        contractAdmin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == contractAdmin, "Only the contract admin can call this function.");
        _;
    }

    function createElection(bytes32 _electionId, uint8 _numCandidates) public onlyAdmin {
        require(!elections[_electionId].exists, "Election already exists.");
        require(_numCandidates >= 2 && _numCandidates <= 3, "Candidate count must be 2 or 3.");
        elections[_electionId].exists = true;
        elections[_electionId].candidatesCount = _numCandidates;
    }

    function toggleElectionState(bytes32 _electionId, bool _isActive) public onlyAdmin {
        require(elections[_electionId].exists, "Election does not exist.");
        elections[_electionId].isActive = _isActive;
    }

    // The vote function now accepts the student's unique ID
    function vote(bytes32 _electionId, uint8 _candidateId, bytes32 _voterId) public {
        Election storage currentElection = elections[_electionId];
        
        require(currentElection.isActive, "This election is not active.");
        // It now checks the voter's unique ID, not the messenger's address
        require(!currentElection.hasVoted[_voterId], "You have already voted in this election.");
        require(_candidateId > 0 && _candidateId <= currentElection.candidatesCount, "Invalid candidate ID.");
        
        currentElection.hasVoted[_voterId] = true;
        currentElection.votes[_candidateId]++;
        
        emit Voted(_electionId, _candidateId, _voterId);
    }

    function getVoteCount(bytes32 _electionId, uint8 _candidateId) public view returns (uint256) {
        return elections[_electionId].votes[_candidateId];
    }
}