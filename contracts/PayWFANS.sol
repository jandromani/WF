// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "./vendor/oz/access/AccessControl.sol";
import {ReentrancyGuard} from "./vendor/oz/utils/ReentrancyGuard.sol";
import {SafeERC20} from "./vendor/oz/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "./vendor/oz/token/ERC20/IERC20.sol";
import {WorldFansData} from "./WorldFansData.sol";
import {WorldFansTreasury} from "./WorldFansTreasury.sol";

contract PayWFANS is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint16 public constant MAX_FEE_BPS = 2_000; // 20%
    uint256 private constant BPS_DENOMINATOR = 10_000;

    IERC20 public immutable token;
    WorldFansData public dataContract;
    WorldFansTreasury public treasury;

    uint16 public feeBps;
    uint256 public minTipAmount;

    event TipProcessed(address indexed fan, address indexed creator, uint256 grossAmount, uint256 feeAmount, uint256 burnAmount);
    event SubscriptionProcessed(
        address indexed fan,
        address indexed creator,
        uint256 grossAmount,
        uint64 cycles,
        uint256 feeAmount,
        uint256 burnAmount,
        uint64 expiresAt
    );
    event FeeBpsUpdated(uint16 oldFeeBps, uint16 newFeeBps);
    event MinTipUpdated(uint256 oldValue, uint256 newValue);
    event TreasuryUpdated(address indexed newTreasury);
    event DataContractUpdated(address indexed newDataContract);

    constructor(
        address admin,
        IERC20 token_,
        WorldFansData data_,
        WorldFansTreasury treasury_,
        uint16 feeBps_,
        uint256 minTipAmount_
    ) {
        require(admin != address(0), "PayWFANS: admin required");
        require(address(token_) != address(0), "PayWFANS: token required");
        require(address(data_) != address(0), "PayWFANS: data required");
        require(address(treasury_) != address(0), "PayWFANS: treasury required");
        require(feeBps_ <= MAX_FEE_BPS, "PayWFANS: fee too high");

        token = token_;
        dataContract = data_;
        treasury = treasury_;
        feeBps = feeBps_;
        minTipAmount = minTipAmount_;

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    function setFeeBps(uint16 newFeeBps) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newFeeBps <= MAX_FEE_BPS, "PayWFANS: fee too high");
        emit FeeBpsUpdated(feeBps, newFeeBps);
        feeBps = newFeeBps;
    }

    function setMinTipAmount(uint256 newMinTipAmount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        emit MinTipUpdated(minTipAmount, newMinTipAmount);
        minTipAmount = newMinTipAmount;
    }

    function setTreasury(WorldFansTreasury newTreasury) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(address(newTreasury) != address(0), "PayWFANS: treasury required");
        treasury = newTreasury;
        emit TreasuryUpdated(address(newTreasury));
    }

    function setDataContract(WorldFansData newDataContract) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(address(newDataContract) != address(0), "PayWFANS: data required");
        dataContract = newDataContract;
        emit DataContractUpdated(address(newDataContract));
    }

    function tip(address creator, uint256 amount) external nonReentrant {
        require(amount >= minTipAmount, "PayWFANS: amount too low");
        _requireCreatorActive(creator);
        (uint256 feeAmount, uint256 burnAmount) = _collectAndDistribute(msg.sender, creator, amount);
        emit TipProcessed(msg.sender, creator, amount, feeAmount, burnAmount);
    }

    function subscribe(address creator, uint64 cycles) external nonReentrant {
        require(cycles > 0, "PayWFANS: invalid cycles");
        WorldFansData.Creator memory creatorInfo = dataContract.getCreator(creator);
        require(creatorInfo.active, "PayWFANS: creator inactive");
        require(creatorInfo.monthlyPrice > 0, "PayWFANS: price not set");

        uint256 amount = creatorInfo.monthlyPrice * uint256(cycles);
        require(amount > 0, "PayWFANS: invalid amount");

        (uint256 feeAmount, uint256 burnAmount) = _collectAndDistribute(msg.sender, creator, amount);
        dataContract.recordSubscription(msg.sender, creator, cycles);
        WorldFansData.Subscription memory sub = dataContract.getSubscription(msg.sender, creator);
        emit SubscriptionProcessed(
            msg.sender,
            creator,
            amount,
            cycles,
            feeAmount,
            burnAmount,
            sub.expiresAt
        );
    }

    function previewNetAmount(uint256 grossAmount)
        external
        view
        returns (uint256 netAmount, uint256 feeAmount, uint256 burnAmount)
    {
        feeAmount = _calculateFee(grossAmount);
        burnAmount = _calculateBurn(grossAmount);
        require(grossAmount >= feeAmount + burnAmount, "PayWFANS: payout negative");
        netAmount = grossAmount - feeAmount - burnAmount;
    }

    function _collectAndDistribute(address fan, address creator, uint256 amount)
        internal
        returns (uint256 feeAmount, uint256 burnAmount)
    {
        require(creator != address(0), "PayWFANS: invalid creator");
        require(amount > 0, "PayWFANS: invalid amount");

        token.safeTransferFrom(fan, address(this), amount);

        feeAmount = _calculateFee(amount);
        burnAmount = _calculateBurn(amount);
        require(amount > feeAmount + burnAmount, "PayWFANS: payout too small");

        uint256 payout = amount - feeAmount - burnAmount;
        token.safeTransfer(creator, payout);

        if (feeAmount + burnAmount > 0) {
            token.safeTransfer(address(treasury), feeAmount + burnAmount);
            treasury.handlePayment(feeAmount, burnAmount);
        }
    }

    function _requireCreatorActive(address creator) internal view {
        require(dataContract.isCreatorActive(creator), "PayWFANS: creator inactive");
    }

    function _calculateFee(uint256 amount) internal view returns (uint256) {
        return (amount * feeBps) / BPS_DENOMINATOR;
    }

    function _calculateBurn(uint256 amount) internal view returns (uint256) {
        uint16 burnBps = treasury.currentBurnBps();
        return (amount * burnBps) / BPS_DENOMINATOR;
    }
}
