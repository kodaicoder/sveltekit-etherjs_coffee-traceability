// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

struct Position {
    address id;
    string workPlace;
    string role;
}

contract CoffeeTraceability {
    address private _manager;
    mapping(address => Position) public employee;
    mapping(string => string[]) public workPlaceRole;
    string[3] public WorkPlaces = ["Farm", "Roasting Plant", "Coffee Shop"];
    string[3] public farmRoles = ["Harvester", "Processor", "Farm Packager"];
    string[4] public roastingPlantRoles = [
        "Warehouse Keeper",
        "Roaster",
        "Curer",
        "Roasting Plant Packager"
    ];
    string[2] public coffeeShopRoles = ["Store Keeper", "Barista"];

    constructor() {
        _manager = msg.sender;
        workPlaceRole["Farm"] = farmRoles;
        workPlaceRole["Roasting Plant"] = roastingPlantRoles;
        workPlaceRole["Coffee Shop"] = coffeeShopRoles;
    }

    modifier isManager() {
        require(msg.sender == _manager, "Unauthorized, Only Manager can do!");
        _;
    }

    modifier isEmployee() {
        require(
            msg.sender == employee[msg.sender].id,
            "Unauthorized, Only Employee can do!"
        );
        _;
    }

    function register(
        uint256 _workPlace,
        uint256 _role,
        address employeeAddress
    ) public isManager {
        Position memory _position;
        _position.id = employeeAddress;
        _position.workPlace = WorkPlaces[_workPlace - 1];
        _position.role = workPlaceRole[WorkPlaces[_workPlace - 1]][_role - 1];
        employee[employeeAddress] = _position;
    }

    function getWorkPlace() public view returns (string memory) {
        string memory workPlace = "Unauthorized";
        if (_manager == msg.sender) workPlace = "Manager";
        if (employee[msg.sender].id == msg.sender)
            workPlace = employee[msg.sender].workPlace;
        return workPlace;
    }

    function getRole() public view returns (string memory) {
        string memory role = "Unauthorized";
        if (_manager == msg.sender) role = "Manager";
        if (employee[msg.sender].id == msg.sender)
            role = employee[msg.sender].role;
        return role;
    }
}
