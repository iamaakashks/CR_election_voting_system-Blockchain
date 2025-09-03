// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "hardhat/console.sol"; // Useful for debugging

contract Election {
    // --- State Variables ---
    address public electionAdmin;
    string public electionName;
    uint256 public candidatesCount;

    // --- Data Structures ---
    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    // --- Mappings ---
    // Mappings are like hash tables or dictionaries
    mapping(uint256 => Candidate) public candidates;
    mapping(address => bool) public voters; // Stores addresses that have already voted

    // --- Events ---
    // Events emit logs to the blockchain, which our server can listen for.
    event Voted(uint256 indexed candidateId, address voter);

    // --- Constructor ---
    // This runs only once, when the contract is first deployed.
    constructor(string memory _name, string[] memory _candidateNames) {
        console.log("Deploying Election contract for:", _name);
        electionAdmin = msg.sender; // The person who deploys is the admin
        electionName = _name;

        // Add all the initial candidates
        for (uint i = 0; i < _candidateNames.length; i++) {
            addCandidate(_candidateNames[i]);
        }
    }

    // --- Functions ---
    // A private function to add a candidate
    function addCandidate(string memory _name) private {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }

    // The main voting function
    function vote(uint256 _candidateId) public {
        // 1. Check: Has this address already voted?
        require(!voters[msg.sender], "You have already cast your vote.");

        // 2. Check: Is the candidate ID valid?
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate ID.");
        
        // 3. Record the vote
        voters[msg.sender] = true; // Mark this address as having voted
        candidates[_candidateId].voteCount++; // Increment the vote count

        // 4. Emit the event
        emit Voted(_candidateId, msg.sender);
    }
}