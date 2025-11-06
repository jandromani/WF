// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "./vendor/oz/access/AccessControl.sol";

contract WorldFansData is AccessControl {
    bytes32 public constant PRICE_MANAGER_ROLE = keccak256("PRICE_MANAGER_ROLE");
    bytes32 public constant SUBSCRIPTION_UPDATER_ROLE = keccak256("SUBSCRIPTION_UPDATER_ROLE");

    struct Creator {
        uint256 monthlyPrice;
        bool active;
        uint64 lastUpdated;
    }

    struct Subscription {
        uint64 expiresAt;
    }

    mapping(address => Creator) private _creators;
    mapping(address => mapping(address => Subscription)) private _subscriptions;

    uint64 public subscriptionPeriod = 30 days;

    event CreatorUpdated(address indexed creator, uint256 monthlyPrice, bool active);
    event SubscriptionRecorded(address indexed fan, address indexed creator, uint64 expiresAt, uint64 cycles);
    event SubscriptionPeriodUpdated(uint64 newPeriod);

    constructor(address admin) {
        require(admin != address(0), "WorldFansData: admin required");
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(PRICE_MANAGER_ROLE, admin);
        _grantRole(SUBSCRIPTION_UPDATER_ROLE, admin);
    }

    function getCreator(address account) external view returns (Creator memory) {
        return _creators[account];
    }

    function creatorPrice(address account) external view returns (uint256) {
        return _creators[account].monthlyPrice;
    }

    function isCreatorActive(address account) public view returns (bool) {
        return _creators[account].active;
    }

    function getSubscription(address fan, address creator) external view returns (Subscription memory) {
        return _subscriptions[fan][creator];
    }

    function subscriptionValid(address fan, address creator) external view returns (bool) {
        return _subscriptions[fan][creator].expiresAt >= block.timestamp;
    }

    function upsertCreator(address creator, uint256 monthlyPrice, bool active) external onlyRole(PRICE_MANAGER_ROLE) {
        require(creator != address(0), "WorldFansData: invalid creator");
        _creators[creator] = Creator({monthlyPrice: monthlyPrice, active: active, lastUpdated: uint64(block.timestamp)});
        emit CreatorUpdated(creator, monthlyPrice, active);
    }

    function setCreatorPrice(address creator, uint256 monthlyPrice) external onlyRole(PRICE_MANAGER_ROLE) {
        Creator storage info = _creators[creator];
        require(info.lastUpdated != 0, "WorldFansData: creator missing");
        info.monthlyPrice = monthlyPrice;
        info.lastUpdated = uint64(block.timestamp);
        emit CreatorUpdated(creator, monthlyPrice, info.active);
    }

    function setCreatorActive(address creator, bool active) external onlyRole(PRICE_MANAGER_ROLE) {
        Creator storage info = _creators[creator];
        require(info.lastUpdated != 0, "WorldFansData: creator missing");
        info.active = active;
        info.lastUpdated = uint64(block.timestamp);
        emit CreatorUpdated(creator, info.monthlyPrice, active);
    }

    function recordSubscription(address fan, address creator, uint64 cycles) external onlyRole(SUBSCRIPTION_UPDATER_ROLE) {
        require(fan != address(0) && creator != address(0), "WorldFansData: invalid address");
        Creator memory info = _creators[creator];
        require(info.active, "WorldFansData: creator inactive");
        require(info.monthlyPrice > 0, "WorldFansData: price not set");
        require(cycles > 0, "WorldFansData: cycles zero");

        uint64 currentExpiry = _subscriptions[fan][creator].expiresAt;
        uint64 start = currentExpiry > block.timestamp ? currentExpiry : uint64(block.timestamp);
        uint256 extension = uint256(subscriptionPeriod) * uint256(cycles);
        uint256 newExpiry = uint256(start) + extension;
        require(newExpiry <= type(uint64).max, "WorldFansData: expiry overflow");
        uint64 castExpiry = uint64(newExpiry);
        _subscriptions[fan][creator].expiresAt = castExpiry;
        emit SubscriptionRecorded(fan, creator, castExpiry, cycles);
    }

    function setSubscriptionPeriod(uint64 newPeriod) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newPeriod >= 1 days, "WorldFansData: too short");
        subscriptionPeriod = newPeriod;
        emit SubscriptionPeriodUpdated(newPeriod);
    }

    function grantPriceManager(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(PRICE_MANAGER_ROLE, account);
    }

    function revokePriceManager(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(PRICE_MANAGER_ROLE, account);
    }

    function grantSubscriptionUpdater(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(SUBSCRIPTION_UPDATER_ROLE, account);
    }

    function revokeSubscriptionUpdater(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(SUBSCRIPTION_UPDATER_ROLE, account);
    }
}
