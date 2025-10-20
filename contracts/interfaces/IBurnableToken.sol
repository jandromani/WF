// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IBurnableToken {
    function burnFrom(address account, uint256 value) external;
}
