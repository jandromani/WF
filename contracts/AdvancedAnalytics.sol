// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {SimpleOwnable} from "./utils/SimpleOwnable.sol";

contract AdvancedAnalytics is SimpleOwnable {
    struct PlatformMetrics {
        uint256 tvl;
        uint256 dailyVolume;
        uint256 userGrowth;
        uint256 creatorEarnings;
        uint256 tokenVelocity;
        uint256 inflationRate;
        uint256 burnRate;
    }

    struct HealthScore {
        uint256 overallScore;
        uint256 economicHealth;
        uint256 userEngagement;
        uint256 liquidityDepth;
        uint256 securityScore;
    }

    PlatformMetrics private currentMetrics;
    uint256 public metricsUpdatedAt;

    event MetricsUpdated(PlatformMetrics metrics, uint256 timestamp);
    event CorrectiveMeasuresSuggested(HealthScore score);
    event TokenomicsAdjustmentSuggested(HealthScore score);
    event HealthReportGenerated(uint256 timestamp, HealthScore health);

    function updateMetrics(PlatformMetrics calldata metrics) external onlyOwner {
        currentMetrics = metrics;
        metricsUpdatedAt = block.timestamp;
        emit MetricsUpdated(metrics, block.timestamp);
    }

    function calculatePlatformHealth() public view returns (HealthScore memory) {
        PlatformMetrics memory metrics = gatherMetrics();
        uint256 economicHealth = _calculateEconomicHealth(metrics);
        uint256 userEngagement = _calculateUserEngagement(metrics);
        uint256 liquidityDepth = _calculateLiquidityDepth(metrics);
        uint256 securityScore = _calculateSecurityScore(metrics);

        uint256 overallScore = _calculateOverallScore(economicHealth, userEngagement, liquidityDepth, securityScore);

        return HealthScore({
            overallScore: overallScore,
            economicHealth: economicHealth,
            userEngagement: userEngagement,
            liquidityDepth: liquidityDepth,
            securityScore: securityScore
        });
    }

    function gatherMetrics() public view returns (PlatformMetrics memory) {
        return currentMetrics;
    }

    function generateAutomatedReports() external {
        HealthScore memory health = calculatePlatformHealth();

        if (health.overallScore < 700) {
            _triggerCorrectiveMeasures(health);
        }

        if (health.economicHealth < 600) {
            _adjustTokenomicsParameters(health);
        }

        emit HealthReportGenerated(block.timestamp, health);
    }

    function _triggerCorrectiveMeasures(HealthScore memory health) internal {
        emit CorrectiveMeasuresSuggested(health);
    }

    function _adjustTokenomicsParameters(HealthScore memory health) internal {
        emit TokenomicsAdjustmentSuggested(health);
    }

    function _calculateOverallScore(
        uint256 economicHealth,
        uint256 userEngagement,
        uint256 liquidityDepth,
        uint256 securityScore
    ) internal pure returns (uint256) {
        return (economicHealth + userEngagement + liquidityDepth + securityScore) / 4;
    }

    function _calculateEconomicHealth(PlatformMetrics memory metrics) internal pure returns (uint256) {
        uint256 tvlScore = _scorePositiveMetric(metrics.tvl, 1e12);
        uint256 volumeScore = _scorePositiveMetric(metrics.dailyVolume, 5e11);
        uint256 earningsScore = _scorePositiveMetric(metrics.creatorEarnings, 1e10);
        uint256 inflationPenalty = _scoreNegativeMetric(metrics.inflationRate, 2e16);
        uint256 burnBonus = _scorePositiveMetric(metrics.burnRate, 5e9);
        return (tvlScore + volumeScore + earningsScore + inflationPenalty + burnBonus) / 5;
    }

    function _calculateUserEngagement(PlatformMetrics memory metrics) internal pure returns (uint256) {
        uint256 growthScore = _scorePositiveMetric(metrics.userGrowth, 10_000);
        uint256 velocityScore = _scorePositiveMetric(metrics.tokenVelocity, 3e18);
        return (growthScore + velocityScore) / 2;
    }

    function _calculateLiquidityDepth(PlatformMetrics memory metrics) internal pure returns (uint256) {
        uint256 tvlScore = _scorePositiveMetric(metrics.tvl, 1e12);
        uint256 volumeScore = _scorePositiveMetric(metrics.dailyVolume, 5e11);
        uint256 velocityScore = _scorePositiveMetric(metrics.tokenVelocity, 3e18);
        return (tvlScore + volumeScore + velocityScore) / 3;
    }

    function _calculateSecurityScore(PlatformMetrics memory metrics) internal pure returns (uint256) {
        uint256 inflationScore = _scoreNegativeMetric(metrics.inflationRate, 2e16);
        uint256 burnScore = _scorePositiveMetric(metrics.burnRate, 5e9);
        return (inflationScore + burnScore) / 2;
    }

    function _scorePositiveMetric(uint256 value, uint256 target) internal pure returns (uint256) {
        if (value >= target) {
            return 1000;
        }
        return (value * 1000) / target;
    }

    function _scoreNegativeMetric(uint256 value, uint256 optimal) internal pure returns (uint256) {
        if (value <= optimal) {
            return 1000;
        }
        uint256 maxValue = optimal * 2;
        if (value >= maxValue) {
            return 0;
        }
        return ((maxValue - value) * 1000) / optimal;
    }
}
