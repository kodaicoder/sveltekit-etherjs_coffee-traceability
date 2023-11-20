// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

struct Position {
    address id;
    string workPlace;
    string role;
}

struct CoffeeTrace {
    string farmName;
    string harvestingAreaName;
    string workPlace;
    string role;
    string dateStamp;
    uint256 coffeeSpecie;
    string trackState;
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
    string[4] public coffeeSpecies = [
        "Arabica",
        "Robusta",
        "Liberica",
        "Excelsa"
    ];
    uint256 coffeeIdIndex = 1;
    mapping(uint256 => CoffeeTrace[]) public coffeeTraceabilities;

    constructor() {
        _manager = msg.sender;
        workPlaceRole["Farm"] = farmRoles;
        workPlaceRole["Roasting Plant"] = roastingPlantRoles;
        workPlaceRole["Coffee Shop"] = coffeeShopRoles;
    }

    modifier isManager() {
        require(msg.sender == _manager, "Unautherized, Only Manager can do!");
        _;
    }

    modifier isEmployee() {
        require(
            msg.sender == employee[msg.sender].id,
            "Unautherized, Only Employee can do!"
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

    function getCoffeeSpecie(
        uint256 _coffeeSpecie
    ) public view returns (string memory) {
        string memory coffeeSpecie = "Unauthorized";
        coffeeSpecie = coffeeSpecies[_coffeeSpecie - 1];
        return coffeeSpecie;
    }

    event CoffeeTraceabilityStarted(uint256 coffeeId);

    function startCoffeeTraceability(
        string memory farmName,
        string memory harvestingAreaName,
        string memory dateStamp,
        uint256 coffeeSpecie
    ) public isEmployee returns (uint256 traceId) {
        require(
            keccak256(abi.encodePacked(employee[msg.sender].role)) ==
                keccak256(abi.encodePacked("Harvester")),
            "Unautherized, Only Role Harvester can do!"
        );
        CoffeeTrace memory coffeeTrace;
        coffeeTrace.farmName = farmName;
        coffeeTrace.harvestingAreaName = harvestingAreaName;
        coffeeTrace.dateStamp = dateStamp;
        coffeeTrace.role = employee[msg.sender].role;
        coffeeTrace.workPlace = employee[msg.sender].workPlace;
        coffeeTrace.coffeeSpecie = coffeeSpecie - 1;
        coffeeTraceabilities[coffeeIdIndex].push(coffeeTrace);
        uint256 coffeeId = coffeeIdIndex;
        coffeeIdIndex++;
        emit CoffeeTraceabilityStarted(coffeeId);
        return coffeeId;
    }

    event CoffeeTraceabilityUpdate(uint256 coffeeId);

    function updateCoffeeTraceability(
        uint256 coffeeId,
        string memory dateStamp,
        string memory previousTransaction
    ) public isEmployee returns (uint256 traceId) {
        CoffeeTrace[] storage _coffeeTrace = coffeeTraceabilities[coffeeId];
        CoffeeTrace memory coffeeTrace = _coffeeTrace[0];
        coffeeTrace.dateStamp = dateStamp;
        coffeeTrace.role = employee[msg.sender].role;
        coffeeTrace.workPlace = employee[msg.sender].workPlace;
        coffeeTrace.trackState = previousTransaction;
        _coffeeTrace.push(coffeeTrace);

        emit CoffeeTraceabilityUpdate(coffeeId);
        return coffeeId;
    }

    function getCoffeeTraceability(
        uint256 coffeeId
    ) public view returns (CoffeeTrace[] memory) {
        return coffeeTraceabilities[coffeeId];
    }
}
