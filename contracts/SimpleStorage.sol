// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract SimpleStorage {
    uint storedData;

    function setStoredData(uint x) public {
        storedData = x;
    }

    function getStoredData() public view returns (uint) {
        return storedData;
    }

    function getYourBalance() public view returns (uint) {
        return msg.sender.balance;
    }
}
