// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {SimpleOwnable} from "./utils/SimpleOwnable.sol";

contract PredictiveAlerts is SimpleOwnable {
    struct PlatformMetrics {
        uint256 tvl;
        uint256 dailyVolume;
        uint256 userGrowth;
        uint256 creatorEarnings;
        uint256 tokenVelocity;
        uint256 inflationRate;
        uint256 burnRate;
    }

    struct AlertRule {
        string metric;
        uint256 threshold;
        uint256 duration;
        bool isAbove;
        address[] recipients;
    }

    PlatformMetrics private metrics;
    uint256 public metricsUpdatedAt;

    AlertRule[] public alertRules;
    mapping(bytes32 => uint256) public automaticActionThresholds;

    event MetricsUpdated(PlatformMetrics metrics, uint256 timestamp);
    event AlertRuleCreated(uint256 indexed ruleId, string metric, uint256 threshold, bool isAbove);
    event AlertRuleUpdated(uint256 indexed ruleId, string metric, uint256 threshold, bool isAbove);
    event AlertTriggered(string metric, uint256 currentValue, uint256 threshold, address indexed recipient);
    event AutomaticActionTriggered(string metric, uint256 currentValue, uint256 actionThreshold);

    function updateMetrics(PlatformMetrics calldata newMetrics) external onlyOwner {
        metrics = newMetrics;
        metricsUpdatedAt = block.timestamp;
        emit MetricsUpdated(newMetrics, block.timestamp);
    }

    function addAlertRule(AlertRule calldata rule) external onlyOwner returns (uint256) {
        require(bytes(rule.metric).length > 0, "Metric required");
        require(rule.recipients.length > 0, "Recipients required");

        alertRules.push(rule);
        emit AlertRuleCreated(alertRules.length - 1, rule.metric, rule.threshold, rule.isAbove);
        return alertRules.length - 1;
    }

    function updateAlertRule(uint256 ruleId, AlertRule calldata rule) external onlyOwner {
        require(ruleId < alertRules.length, "Invalid rule");
        require(rule.recipients.length > 0, "Recipients required");
        alertRules[ruleId] = rule;
        emit AlertRuleUpdated(ruleId, rule.metric, rule.threshold, rule.isAbove);
    }

    function setAutomaticActionThreshold(string calldata metric, uint256 threshold) external onlyOwner {
        automaticActionThresholds[keccak256(bytes(metric))] = threshold;
    }

    function checkAlertConditions() external {
        PlatformMetrics memory current = gatherMetrics();

        for (uint256 i = 0; i < alertRules.length; i++) {
            AlertRule storage rule = alertRules[i];
            if (rule.duration > 0 && metricsUpdatedAt + rule.duration > block.timestamp) {
                continue;
            }

            uint256 metricValue = _getMetricValue(rule.metric, current);
            bool conditionMet = rule.isAbove ? metricValue > rule.threshold : metricValue < rule.threshold;

            if (conditionMet) {
                _triggerAlert(rule, metricValue);
            }
        }
    }

    function gatherMetrics() public view returns (PlatformMetrics memory) {
        return metrics;
    }

    function _triggerAlert(AlertRule storage rule, uint256 currentValue) internal {
        for (uint256 i = 0; i < rule.recipients.length; i++) {
            emit AlertTriggered(rule.metric, currentValue, rule.threshold, rule.recipients[i]);
        }

        if (_shouldTakeAutomaticAction(rule.metric, currentValue)) {
            _executeAutomaticAction(rule.metric, currentValue);
        }
    }

    function _shouldTakeAutomaticAction(string memory metric, uint256 currentValue) internal view returns (bool) {
        uint256 threshold = automaticActionThresholds[keccak256(bytes(metric))];
        if (threshold == 0) {
            return false;
        }
        return currentValue < threshold;
    }

    function _executeAutomaticAction(string memory metric, uint256 currentValue) internal {
        uint256 threshold = automaticActionThresholds[keccak256(bytes(metric))];
        emit AutomaticActionTriggered(metric, currentValue, threshold);
    }

    function _getMetricValue(string memory metric, PlatformMetrics memory current) internal pure returns (uint256) {
        bytes32 key = keccak256(bytes(metric));
        if (key == keccak256("tvl")) {
            return current.tvl;
        } else if (key == keccak256("dailyVolume")) {
            return current.dailyVolume;
        } else if (key == keccak256("userGrowth")) {
            return current.userGrowth;
        } else if (key == keccak256("creatorEarnings")) {
            return current.creatorEarnings;
        } else if (key == keccak256("tokenVelocity")) {
            return current.tokenVelocity;
        } else if (key == keccak256("inflationRate")) {
            return current.inflationRate;
        } else if (key == keccak256("burnRate")) {
            return current.burnRate;
        }
        revert("Unknown metric");
    }
}
