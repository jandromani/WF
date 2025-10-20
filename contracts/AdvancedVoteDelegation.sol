// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {SimpleOwnable} from "./utils/SimpleOwnable.sol";
import {IERC20Minimal} from "./interfaces/IERC20Minimal.sol";

contract AdvancedVoteDelegation is SimpleOwnable {
    struct Delegation {
        address delegate;
        uint256 amount;
        uint256 untilBlock;
        bool isActive;
    }

    IERC20Minimal public immutable votingToken;

    mapping(address => Delegation) public delegations;
    mapping(address => uint256) public delegatedVotingPower;
    mapping(address => address[]) private delegateBackers;
    mapping(address => mapping(address => bool)) private isDelegateBacker;

    event VoteDelegated(address indexed from, address indexed to, uint256 amount, uint256 durationInBlocks);
    event DelegationRevoked(address indexed from, address indexed to);
    event DelegatedVoteExecuted(uint256 indexed proposalId, address indexed voter, bool support, uint256 votingPower);

    constructor(IERC20Minimal votingToken_) {
        votingToken = votingToken_;
    }

    function delegateVote(address to, uint256 amount, uint256 durationInBlocks) external {
        require(to != address(0), "Invalid delegate");
        require(amount > 0, "Invalid amount");
        require(durationInBlocks > 0, "Invalid duration");
        require(votingToken.balanceOf(msg.sender) >= amount, "Insufficient balance");

        _cleanupDelegation(msg.sender);

        Delegation storage delegation = delegations[msg.sender];
        if (delegation.isActive) {
            delegatedVotingPower[delegation.delegate] -= delegation.amount;
        }

        delegation.delegate = to;
        delegation.amount = amount;
        delegation.untilBlock = block.number + durationInBlocks;
        delegation.isActive = true;

        delegatedVotingPower[to] += amount;

        if (!isDelegateBacker[to][msg.sender]) {
            delegateBackers[to].push(msg.sender);
            isDelegateBacker[to][msg.sender] = true;
        }

        emit VoteDelegated(msg.sender, to, amount, durationInBlocks);
    }

    function revokeDelegation() external {
        Delegation storage delegation = delegations[msg.sender];
        require(delegation.isActive, "No delegation");

        delegatedVotingPower[delegation.delegate] -= delegation.amount;
        delegation.isActive = false;

        emit DelegationRevoked(msg.sender, delegation.delegate);
    }

    function executeDelegatedVote(uint256 proposalId, bool support) external {
        _refreshDelegations(msg.sender);
        uint256 totalVotingPower = votingToken.balanceOf(msg.sender) + delegatedVotingPower[msg.sender];
        require(totalVotingPower > 0, "No voting power");

        _vote(proposalId, support, totalVotingPower);
    }

    function _refreshDelegations(address delegate) internal {
        address[] storage backers = delegateBackers[delegate];
        for (uint256 i = 0; i < backers.length; i++) {
            _cleanupDelegation(backers[i]);
        }
    }

    function _cleanupDelegation(address delegator) internal {
        Delegation storage delegation = delegations[delegator];
        if (delegation.isActive && block.number > delegation.untilBlock) {
            delegatedVotingPower[delegation.delegate] -= delegation.amount;
            delegation.isActive = false;
        }
    }

    function _vote(uint256 proposalId, bool support, uint256 totalVotingPower) internal {
        emit DelegatedVoteExecuted(proposalId, msg.sender, support, totalVotingPower);
    }
}
