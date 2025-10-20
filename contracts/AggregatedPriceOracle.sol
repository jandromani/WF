// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {SimpleOwnable} from "./utils/SimpleOwnable.sol";

interface IPriceOracle {
    function getLatestPrice() external view returns (uint256);
}

contract AggregatedPriceOracle is SimpleOwnable {
    struct OracleSource {
        uint256 weight;
        bool isActive;
        bool exists;
    }

    struct PriceRecord {
        uint256 price;
        uint256 weight;
    }

    uint256 public constant MIN_CONSENSUS = 70;

    mapping(address => OracleSource) private oracleSources;
    address[] private oracleList;

    event OracleUpdated(address indexed oracle, uint256 weight, bool isActive);

    function setOracle(address oracle, uint256 weight, bool isActive) external onlyOwner {
        require(oracle != address(0), "Invalid oracle");
        require(weight > 0, "Weight must be positive");

        OracleSource storage source = oracleSources[oracle];
        if (!source.exists) {
            oracleList.push(oracle);
            source.exists = true;
        }

        source.weight = weight;
        source.isActive = isActive;

        emit OracleUpdated(oracle, weight, isActive);
    }

    function getOracle(address oracle) external view returns (OracleSource memory) {
        return oracleSources[oracle];
    }

    function getOracleAddresses() external view returns (address[] memory) {
        return oracleList;
    }

    function getConsensusPrice() external view returns (uint256) {
        uint256 oracleCount = oracleList.length;
        require(oracleCount > 0, "No oracles configured");

        PriceRecord[] memory records = new PriceRecord[](oracleCount);
        uint256 activeRecords;
        uint256 totalActiveWeight;
        uint256 respondedWeight;

        for (uint256 i = 0; i < oracleCount; i++) {
            address oracleAddress = oracleList[i];
            OracleSource storage source = oracleSources[oracleAddress];
            if (!source.isActive || source.weight == 0) {
                continue;
            }

            totalActiveWeight += source.weight;

            try IPriceOracle(oracleAddress).getLatestPrice() returns (uint256 price) {
                records[activeRecords] = PriceRecord({price: price, weight: source.weight});
                activeRecords++;
                respondedWeight += source.weight;
            } catch {
                // Skip oracle failures but continue evaluating consensus
            }
        }

        require(activeRecords > 0, "No active oracle responses");
        require(totalActiveWeight > 0, "No oracle weight configured");
        require(respondedWeight * 100 >= totalActiveWeight * MIN_CONSENSUS, "Consensus not met");

        PriceRecord[] memory trimmed = new PriceRecord[](activeRecords);
        for (uint256 i = 0; i < activeRecords; i++) {
            trimmed[i] = records[i];
        }

        PriceRecord[] memory sorted = _sort(trimmed);
        uint256 threshold = (respondedWeight + 1) / 2;
        uint256 cumulativeWeight;

        for (uint256 i = 0; i < sorted.length; i++) {
            cumulativeWeight += sorted[i].weight;
            if (cumulativeWeight >= threshold) {
                return sorted[i].price;
            }
        }

        revert("Median not found");
    }

    function _sort(PriceRecord[] memory records) internal pure returns (PriceRecord[] memory) {
        uint256 length = records.length;
        for (uint256 i = 0; i < length; i++) {
            for (uint256 j = i + 1; j < length; j++) {
                if (records[i].price > records[j].price) {
                    PriceRecord memory temp = records[i];
                    records[i] = records[j];
                    records[j] = temp;
                }
            }
        }
        return records;
    }
}
