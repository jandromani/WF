// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {SimpleOwnable} from "./utils/SimpleOwnable.sol";
import {IBurnableToken} from "./interfaces/IBurnableToken.sol";

interface IMigratable {
    function notifyMigration(address user, uint256 amount) external;
}

contract SeamlessMigration is SimpleOwnable {
    struct MigrationWindow {
        uint256 startBlock;
        uint256 endBlock;
        address newContract;
        bool isActive;
    }

    IBurnableToken public immutable token;
    MigrationWindow public currentMigration;
    mapping(address => uint256) public migratedBalances;

    event MigrationStarted(address indexed newContract, uint256 endBlock);
    event MigrationClosed(address indexed newContract, uint256 blockNumber);
    event TokensMigrated(address indexed user, uint256 amount);

    constructor(IBurnableToken token_) {
        token = token_;
    }

    function startMigration(address newContract, uint256 migrationDuration) external onlyOwner {
        require(newContract != address(0), "Invalid contract");
        require(migrationDuration > 0, "Invalid duration");
        currentMigration = MigrationWindow({
            startBlock: block.number,
            endBlock: block.number + migrationDuration,
            newContract: newContract,
            isActive: true
        });
        emit MigrationStarted(newContract, currentMigration.endBlock);
    }

    function closeMigration() external onlyOwner {
        require(currentMigration.isActive, "No migration");
        currentMigration.isActive = false;
        emit MigrationClosed(currentMigration.newContract, block.number);
    }

    function migrateTokens(uint256 amount) external {
        require(amount > 0, "Invalid amount");
        require(currentMigration.isActive, "Migration inactive");
        require(block.number <= currentMigration.endBlock, "Migration ended");

        token.burnFrom(msg.sender, amount);
        migratedBalances[msg.sender] += amount;

        IMigratable(currentMigration.newContract).notifyMigration(msg.sender, amount);

        emit TokensMigrated(msg.sender, amount);
    }
}
