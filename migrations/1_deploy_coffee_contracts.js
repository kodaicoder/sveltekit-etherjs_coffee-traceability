var CoffeeTraceability = artifacts.require("./CoffeeTraceability.sol");

module.exports = function (deployer) {
    deployer.deploy(CoffeeTraceability);
};