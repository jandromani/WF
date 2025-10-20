// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {SimpleOwnable} from "./utils/SimpleOwnable.sol";

contract StakingInsurance is SimpleOwnable {
    struct InsurancePolicy {
        uint256 stakedAmount;
        uint256 premiumPaid;
        uint256 coverageAmount;
        uint256 startTime;
        uint256 duration;
        bool claimed;
    }

    uint256 public constant PREMIUM_RATE_BPS = 100;
    uint256 public constant COVERAGE_RATE_BPS = 9000;

    mapping(address => InsurancePolicy) private policies;
    mapping(address => bool) public compromisedPositions;

    event InsurancePurchased(address indexed user, uint256 stakedAmount, uint256 coverageAmount, uint256 duration);
    event InsuranceClaimed(address indexed user, uint256 coverageAmount);
    event StakingStatusUpdated(address indexed user, bool compromised);

    function getPolicy(address user) external view returns (InsurancePolicy memory) {
        return policies[user];
    }

    function purchaseInsurance(uint256 stakedAmount) external payable {
        require(stakedAmount > 0, "Invalid stake amount");
        InsurancePolicy storage existing = policies[msg.sender];
        if (existing.startTime != 0 && block.timestamp < existing.startTime + existing.duration && !existing.claimed) {
            revert("Active policy already exists");
        }

        uint256 premium = (stakedAmount * PREMIUM_RATE_BPS) / 10_000;
        require(premium > 0, "Premium too low");
        require(msg.value >= premium, "Insufficient premium");

        uint256 duration = 30 days;
        policies[msg.sender] = InsurancePolicy({
            stakedAmount: stakedAmount,
            premiumPaid: premium,
            coverageAmount: (stakedAmount * COVERAGE_RATE_BPS) / 10_000,
            startTime: block.timestamp,
            duration: duration,
            claimed: false
        });

        if (msg.value > premium) {
            payable(msg.sender).transfer(msg.value - premium);
        }

        emit InsurancePurchased(msg.sender, stakedAmount, policies[msg.sender].coverageAmount, duration);
    }

    function updateStakingStatus(address user, bool compromised) external onlyOwner {
        compromisedPositions[user] = compromised;
        emit StakingStatusUpdated(user, compromised);
    }

    function claimInsurance() external {
        InsurancePolicy storage policy = policies[msg.sender];
        require(policy.startTime != 0, "No policy");
        require(!policy.claimed, "Already claimed");
        require(block.timestamp <= policy.startTime + policy.duration, "Policy expired");
        require(_isStakingCompromised(msg.sender), "Staking healthy");

        policy.claimed = true;
        uint256 payout = policy.coverageAmount;
        policy.coverageAmount = 0;

        (bool sent, ) = payable(msg.sender).call{value: payout}("");
        require(sent, "Transfer failed");

        emit InsuranceClaimed(msg.sender, payout);
    }

    function _isStakingCompromised(address user) internal view returns (bool) {
        return compromisedPositions[user];
    }
}
