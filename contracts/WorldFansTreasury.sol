// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "./vendor/oz/access/AccessControl.sol";
import {SafeERC20} from "./vendor/oz/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "./vendor/oz/token/ERC20/IERC20.sol";
import {IERC20Burnable} from "./vendor/oz/token/ERC20/extensions/IERC20Burnable.sol";

contract WorldFansTreasury is AccessControl {
    using SafeERC20 for IERC20;

    bytes32 public constant PAY_MODULE_ROLE = keccak256("PAY_MODULE_ROLE");
    bytes32 public constant SUPPLY_MANAGER_ROLE = keccak256("SUPPLY_MANAGER_ROLE");
    bytes32 public constant EPOCH_MANAGER_ROLE = keccak256("EPOCH_MANAGER_ROLE");

    IERC20 public immutable token;
    IERC20Burnable public immutable burnable;

    address public treasuryWallet;
    address public creatorRewardsVault;
    address public communityPool;
    address public growthReserve;

    uint256 public epochEmission;
    uint64 public epochLength = 7 days;
    uint64 public lastEpochTimestamp;
    uint256 public epochsProcessed;
    uint256 public epochsPerQuarter = 13;

    uint256 public targetSupply;
    uint256 public circulatingSupply;

    uint16 public minBurnBps = 300;
    uint16 public maxBurnBps = 1200;

    event VaultsUpdated(address treasuryWallet, address creatorRewardsVault, address communityPool, address growthReserve);
    event EpochProcessed(uint256 indexed epochNumber, uint256 emissionAmount, uint256 newEmissionAmount);
    event EpochEmissionUpdated(uint256 oldEmission, uint256 newEmission);
    event EpochLengthUpdated(uint64 oldLength, uint64 newLength);
    event EpochsPerQuarterUpdated(uint256 oldValue, uint256 newValue);
    event BurnBpsUpdated(uint16 minBurnBps, uint16 maxBurnBps);
    event SupplyUpdated(uint256 circulatingSupply, uint256 targetSupply);
    event PaymentHandled(address indexed payer, uint256 feeAmount, uint256 burnAmount);

    constructor(
        address admin,
        IERC20 token_,
        IERC20Burnable burnable_,
        uint256 initialEmission,
        uint256 initialTargetSupply
    ) {
        require(admin != address(0), "WorldFansTreasury: admin required");
        require(address(token_) != address(0), "WorldFansTreasury: token required");
        token = token_;
        burnable = burnable_;
        epochEmission = initialEmission;
        targetSupply = initialTargetSupply;

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(PAY_MODULE_ROLE, admin);
        _grantRole(SUPPLY_MANAGER_ROLE, admin);
        _grantRole(EPOCH_MANAGER_ROLE, admin);
    }

    function setVaults(
        address treasuryWallet_,
        address creatorRewardsVault_,
        address communityPool_,
        address growthReserve_
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(treasuryWallet_ != address(0), "WorldFansTreasury: treasury required");
        require(creatorRewardsVault_ != address(0), "WorldFansTreasury: creators required");
        require(communityPool_ != address(0), "WorldFansTreasury: community required");
        require(growthReserve_ != address(0), "WorldFansTreasury: growth required");
        treasuryWallet = treasuryWallet_;
        creatorRewardsVault = creatorRewardsVault_;
        communityPool = communityPool_;
        growthReserve = growthReserve_;
        emit VaultsUpdated(treasuryWallet_, creatorRewardsVault_, communityPool_, growthReserve_);
    }

    function setEpochEmission(uint256 newEmission) external onlyRole(EPOCH_MANAGER_ROLE) {
        emit EpochEmissionUpdated(epochEmission, newEmission);
        epochEmission = newEmission;
    }

    function setEpochLength(uint64 newLength) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newLength >= 1 days, "WorldFansTreasury: epoch too short");
        emit EpochLengthUpdated(epochLength, newLength);
        epochLength = newLength;
    }

    function setEpochsPerQuarter(uint256 newValue) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newValue > 0, "WorldFansTreasury: invalid quarter");
        emit EpochsPerQuarterUpdated(epochsPerQuarter, newValue);
        epochsPerQuarter = newValue;
    }

    function setBurnBps(uint16 minBurnBps_, uint16 maxBurnBps_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(minBurnBps_ <= maxBurnBps_, "WorldFansTreasury: invalid range");
        require(maxBurnBps_ <= 2000, "WorldFansTreasury: burn too high");
        minBurnBps = minBurnBps_;
        maxBurnBps = maxBurnBps_;
        emit BurnBpsUpdated(minBurnBps_, maxBurnBps_);
    }

    function updateSupply(uint256 newCirculatingSupply, uint256 newTargetSupply) external onlyRole(SUPPLY_MANAGER_ROLE) {
        circulatingSupply = newCirculatingSupply;
        if (newTargetSupply > 0) {
            targetSupply = newTargetSupply;
        }
        emit SupplyUpdated(circulatingSupply, targetSupply);
    }

    function currentBurnBps() public view returns (uint16) {
        if (targetSupply == 0 || circulatingSupply <= targetSupply) {
            return minBurnBps;
        }
        uint256 excessBps = ((circulatingSupply - targetSupply) * 10_000) / targetSupply;
        if (excessBps >= 10_000) {
            return maxBurnBps;
        }
        uint256 range = uint256(maxBurnBps) - uint256(minBurnBps);
        uint256 scaled = (range * excessBps) / 10_000;
        return uint16(uint256(minBurnBps) + scaled);
    }

    function processEpoch() external onlyRole(EPOCH_MANAGER_ROLE) returns (uint256) {
        require(
            treasuryWallet != address(0)
                && creatorRewardsVault != address(0)
                && communityPool != address(0)
                && growthReserve != address(0),
            "WorldFansTreasury: vaults not set"
        );
        require(block.timestamp >= lastEpochTimestamp + epochLength, "WorldFansTreasury: epoch not elapsed");
        lastEpochTimestamp = uint64(block.timestamp);
        epochsProcessed += 1;

        uint256 emission = epochEmission;
        if (emission > 0) {
            require(token.balanceOf(address(this)) >= emission, "WorldFansTreasury: insufficient balance");
            uint256 toTreasury = (emission * 4000) / 10_000;
            uint256 toCreators = (emission * 3500) / 10_000;
            uint256 toCommunity = (emission * 1500) / 10_000;
            uint256 toGrowth = emission - toTreasury - toCreators - toCommunity;

            token.safeTransfer(treasuryWallet, toTreasury);
            token.safeTransfer(creatorRewardsVault, toCreators);
            token.safeTransfer(communityPool, toCommunity);
            token.safeTransfer(growthReserve, toGrowth);
        }

        if (epochsProcessed % epochsPerQuarter == 0) {
            uint256 newEmission = (epochEmission * 95) / 100;
            emit EpochEmissionUpdated(epochEmission, newEmission);
            epochEmission = newEmission;
        }

        emit EpochProcessed(epochsProcessed, emission, epochEmission);
        return emission;
    }

    function handlePayment(uint256 feeAmount, uint256 burnAmount) external onlyRole(PAY_MODULE_ROLE) {
        if (burnAmount > 0) {
            burnable.burn(burnAmount);
        }
        emit PaymentHandled(_msgSender(), feeAmount, burnAmount);
    }

    function grantPayModule(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(PAY_MODULE_ROLE, account);
    }

    function revokePayModule(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(PAY_MODULE_ROLE, account);
    }

    function grantSupplyManager(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(SUPPLY_MANAGER_ROLE, account);
    }

    function revokeSupplyManager(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(SUPPLY_MANAGER_ROLE, account);
    }

    function grantEpochManager(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(EPOCH_MANAGER_ROLE, account);
    }

    function revokeEpochManager(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(EPOCH_MANAGER_ROLE, account);
    }
}
