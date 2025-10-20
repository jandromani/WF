// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {SimpleOwnable} from "./utils/SimpleOwnable.sol";
import {IERC20Minimal} from "./interfaces/IERC20Minimal.sol";

contract ReputationGovernance is SimpleOwnable {
    struct VoterReputation {
        uint256 reputationScore;
        uint256 successfulVotes;
        uint256 totalVotes;
        uint256 lastVoteTime;
        uint256 consecutiveSuccessfulVotes;
    }

    struct Proposal {
        uint256 forVotes;
        uint256 againstVotes;
        uint256 deadline;
        bool exists;
    }

    uint256 public constant REPUTATION_THRESHOLD = 1_000;

    IERC20Minimal public immutable votingToken;

    mapping(address => VoterReputation) public reputations;
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    event ProposalCreated(uint256 indexed proposalId, uint256 deadline);
    event VoterReputationUpdated(address indexed voter, uint256 newReputationScore);
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool support, uint256 votingPower);

    constructor(IERC20Minimal votingToken_) {
        votingToken = votingToken_;
    }

    function createProposal(uint256 proposalId, uint256 votingPeriod) external onlyOwner {
        require(votingPeriod > 0, "Invalid period");
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.exists, "Proposal exists");
        proposal.exists = true;
        proposal.deadline = block.timestamp + votingPeriod;
        emit ProposalCreated(proposalId, proposal.deadline);
    }

    function voteWithReputation(uint256 proposalId, bool support) external {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.exists, "Unknown proposal");
        require(block.timestamp < proposal.deadline, "Voting ended");
        require(!hasVoted[proposalId][msg.sender], "Already voted");

        uint256 votingPower = getVotingPower(msg.sender);
        require(votingPower > 0, "No voting power");

        hasVoted[proposalId][msg.sender] = true;
        _vote(proposalId, proposal, support, votingPower);

        bool successful = _isVoteSuccessful(proposal, support);
        VoterReputation storage rep = reputations[msg.sender];

        if (successful) {
            rep.successfulVotes += 1;
            rep.consecutiveSuccessfulVotes += 1;
            rep.reputationScore += _calculateReputationReward(rep.consecutiveSuccessfulVotes);
        } else {
            rep.consecutiveSuccessfulVotes = 0;
            rep.reputationScore = (rep.reputationScore * 95) / 100;
        }

        rep.totalVotes += 1;
        rep.lastVoteTime = block.timestamp;

        emit VoterReputationUpdated(msg.sender, rep.reputationScore);
    }

    function getVotingPower(address voter) public view returns (uint256) {
        uint256 tokenBalance = votingToken.balanceOf(voter);
        if (tokenBalance == 0) {
            return 0;
        }
        uint256 multiplier = _calculateReputationMultiplier(reputations[voter].reputationScore);
        return (tokenBalance * multiplier) / 10_000;
    }

    function _vote(uint256 proposalId, Proposal storage proposal, bool support, uint256 votingPower) internal {
        if (support) {
            proposal.forVotes += votingPower;
        } else {
            proposal.againstVotes += votingPower;
        }

        emit VoteCast(proposalId, msg.sender, support, votingPower);
    }

    function _isVoteSuccessful(Proposal storage proposal, bool support) internal view returns (bool) {
        if (support) {
            return proposal.forVotes >= proposal.againstVotes;
        } else {
            return proposal.againstVotes > proposal.forVotes;
        }
    }

    function _calculateReputationReward(uint256 consecutiveSuccessfulVotes) internal pure returns (uint256) {
        return 50 + (consecutiveSuccessfulVotes * 10);
    }

    function _calculateReputationMultiplier(uint256 reputationScore) internal pure returns (uint256) {
        uint256 baseMultiplier = 10_000;
        if (reputationScore == 0) {
            return baseMultiplier;
        }

        if (reputationScore < REPUTATION_THRESHOLD) {
            return baseMultiplier + (reputationScore * 2);
        }

        uint256 bonus = (reputationScore - REPUTATION_THRESHOLD) * 5;
        return baseMultiplier + (REPUTATION_THRESHOLD * 2) + bonus;
    }
}
