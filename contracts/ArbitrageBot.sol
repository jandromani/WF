// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {SimpleOwnable} from "./utils/SimpleOwnable.sol";

contract ArbitrageBot is SimpleOwnable {
    struct LiquidityPool {
        address poolAddress;
        uint256 wldyReserve;
        uint256 wfansReserve;
    }

    LiquidityPool[] private pools;

    uint256 public constant MIN_PROFIT_THRESHOLD = 1e18;

    uint256 public lastBuyPoolId;
    uint256 public lastSellPoolId;
    uint256 public lastEstimatedProfit;
    uint256 public cumulativeEstimatedProfit;

    event PoolConfigured(uint256 indexed poolId, address poolAddress, uint256 wldyReserve, uint256 wfansReserve);
    event ArbitrageExecuted(uint256 indexed buyPoolId, uint256 indexed sellPoolId, uint256 estimatedProfit);

    function poolCount() external view returns (uint256) {
        return pools.length;
    }

    function getPool(uint256 poolId) external view returns (LiquidityPool memory) {
        require(poolId < pools.length, "Invalid pool");
        return pools[poolId];
    }

    function upsertPool(uint256 poolId, address poolAddress, uint256 wldyReserve, uint256 wfansReserve) external onlyOwner {
        require(poolAddress != address(0), "Invalid pool address");
        require(wldyReserve > 0 && wfansReserve > 0, "Invalid reserves");

        if (poolId >= pools.length) {
            pools.push(LiquidityPool({poolAddress: poolAddress, wldyReserve: wldyReserve, wfansReserve: wfansReserve}));
            emit PoolConfigured(pools.length - 1, poolAddress, wldyReserve, wfansReserve);
        } else {
            pools[poolId] = LiquidityPool({poolAddress: poolAddress, wldyReserve: wldyReserve, wfansReserve: wfansReserve});
            emit PoolConfigured(poolId, poolAddress, wldyReserve, wfansReserve);
        }
    }

    function executeArbitrage() external {
        (uint256 bestBuyPool, uint256 bestSellPool, uint256 profit) = _findArbitrageOpportunity();

        if (profit >= MIN_PROFIT_THRESHOLD) {
            _executeArbitrage(bestBuyPool, bestSellPool, profit);
            emit ArbitrageExecuted(bestBuyPool, bestSellPool, profit);
        }
    }

    function _findArbitrageOpportunity() internal view returns (uint256, uint256, uint256) {
        uint256 poolLength = pools.length;
        if (poolLength < 2) {
            return (0, 0, 0);
        }

        uint256 maxProfit;
        uint256 bestBuyPool;
        uint256 bestSellPool;

        for (uint256 i = 0; i < poolLength; i++) {
            for (uint256 j = 0; j < poolLength; j++) {
                if (i == j) continue;
                uint256 profit = _calculateArbitrageProfit(i, j);
                if (profit > maxProfit) {
                    maxProfit = profit;
                    bestBuyPool = i;
                    bestSellPool = j;
                }
            }
        }

        return (bestBuyPool, bestSellPool, maxProfit);
    }

    function _calculateArbitrageProfit(uint256 buyPoolId, uint256 sellPoolId) internal view returns (uint256) {
        LiquidityPool storage buyPool = pools[buyPoolId];
        LiquidityPool storage sellPool = pools[sellPoolId];

        if (buyPool.wldyReserve == 0 || sellPool.wldyReserve == 0) {
            return 0;
        }

        uint256 buyPrice = (buyPool.wfansReserve * 1e18) / buyPool.wldyReserve;
        uint256 sellPrice = (sellPool.wfansReserve * 1e18) / sellPool.wldyReserve;

        if (sellPrice <= buyPrice) {
            return 0;
        }

        return sellPrice - buyPrice;
    }

    function _executeArbitrage(uint256 buyPoolId, uint256 sellPoolId, uint256 profit) internal {
        lastBuyPoolId = buyPoolId;
        lastSellPoolId = sellPoolId;
        lastEstimatedProfit = profit;
        cumulativeEstimatedProfit += profit;
    }
}
