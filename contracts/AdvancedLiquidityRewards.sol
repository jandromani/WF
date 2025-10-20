// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {SimpleOwnable} from "./utils/SimpleOwnable.sol";
import {IRewardMinter} from "./interfaces/IRewardMinter.sol";

contract AdvancedLiquidityRewards is SimpleOwnable {
    struct VestingSchedule {
        uint256 totalAmount;
        uint256 releasedAmount;
        uint256 startTime;
        uint256 duration;
        uint256 cliff;
    }

    struct LiquidityPosition {
        uint256 wldyAmount;
        uint256 wfansAmount;
        uint256 timestamp;
    }

    IRewardMinter public immutable rewardToken;

    mapping(address => VestingSchedule[]) public vestingSchedules;
    mapping(address => LiquidityPosition[]) public liquidityPositions;

    event LiquidityAdded(address indexed provider, uint256 wldyAmount, uint256 wfansAmount);
    event VestingScheduleCreated(address indexed user, uint256 scheduleIndex, uint256 totalAmount, uint256 duration, uint256 cliff);
    event VestedRewardsClaimed(address indexed user, uint256 scheduleIndex, uint256 amount);

    constructor(IRewardMinter rewardToken_) {
        rewardToken = rewardToken_;
    }

    function addLiquidityWithVesting(uint256 wldyAmount, uint256 wfansAmount, uint256 vestingDuration) external {
        require(wldyAmount > 0 && wfansAmount > 0, "Invalid liquidity");
        require(vestingDuration >= 1 days, "Duration too short");

        _addLiquidity(msg.sender, wldyAmount, wfansAmount);

        uint256 rewards = _calculateLiquidityRewards(wldyAmount + wfansAmount);
        uint256 cliff = vestingDuration / 4;

        vestingSchedules[msg.sender].push(
            VestingSchedule({
                totalAmount: rewards,
                releasedAmount: 0,
                startTime: block.timestamp,
                duration: vestingDuration,
                cliff: cliff
            })
        );

        emit VestingScheduleCreated(msg.sender, vestingSchedules[msg.sender].length - 1, rewards, vestingDuration, cliff);
    }

    function claimVestedRewards(uint256 scheduleIndex) external {
        require(scheduleIndex < vestingSchedules[msg.sender].length, "Invalid schedule");
        VestingSchedule storage schedule = vestingSchedules[msg.sender][scheduleIndex];

        uint256 releasable = _calculateReleasableAmount(schedule);
        require(releasable > 0, "Nothing to release");

        schedule.releasedAmount += releasable;
        rewardToken.mint(msg.sender, releasable);

        emit VestedRewardsClaimed(msg.sender, scheduleIndex, releasable);
    }

    function getLiquidityPositions(address user) external view returns (LiquidityPosition[] memory) {
        return liquidityPositions[user];
    }

    function _addLiquidity(address provider, uint256 wldyAmount, uint256 wfansAmount) internal {
        liquidityPositions[provider].push(
            LiquidityPosition({wldyAmount: wldyAmount, wfansAmount: wfansAmount, timestamp: block.timestamp})
        );
        emit LiquidityAdded(provider, wldyAmount, wfansAmount);
    }

    function _calculateLiquidityRewards(uint256 totalAmount) internal pure returns (uint256) {
        return (totalAmount * 10) / 100;
    }

    function _calculateReleasableAmount(VestingSchedule storage schedule) internal view returns (uint256) {
        if (schedule.releasedAmount >= schedule.totalAmount) {
            return 0;
        }

        if (block.timestamp < schedule.startTime + schedule.cliff) {
            return 0;
        }

        if (block.timestamp >= schedule.startTime + schedule.duration) {
            return schedule.totalAmount - schedule.releasedAmount;
        }

        uint256 elapsed = block.timestamp - schedule.startTime;
        uint256 vested = (schedule.totalAmount * elapsed) / schedule.duration;
        if (vested <= schedule.releasedAmount) {
            return 0;
        }

        return vested - schedule.releasedAmount;
    }
}
