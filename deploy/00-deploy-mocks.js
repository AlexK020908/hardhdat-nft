//hardhat or local host does not have its price contracts

const { network } = require("hardhat")
const DECIMALS = "8"
const INITIAL_PRICE = "100000000000" // 1000
const BASE_FEE = "250000000000000000" // 0.25 is this the premium in LINK?
const GAS_PRICE_LINK = 1e9 // link per gas, is this the gas lane? // 0.000000001 LINK per gas
module.exports = async ({ getNamedAccounts, deployments }) => {
    //const { getNamedAccounts, deployment } = hre we are pulling them out, doing the same thing as what we did above in the brackets
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    //the getnamedaccounts gets the named accounts --> check if hardhat config, where we added a field called namedacounts and gave a deployer account an index of zero in the accounts array
    //here we are getting the chainID
    const chainId = network.config.chainId

    //FIRST we do not want to deploy it to a real testing network
    if (chainId == 31337) {
        //or we coudl do if(devChains.includes(network.name))
        log("local network detected, deploy mocks...")
        await deploy("VRFCoordinatorV2Mock", {
            contract: "VRFCoordinatorV2Mock",
            from: deployer,
            log: true,
            args: [BASE_FEE, GAS_PRICE_LINK], //cuz mockv3aggrefator takes two arguments
        })

        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_PRICE],
        })

        /*

  constructor(
    uint8 _decimals,
    int256 _initialAnswer
        */
    }

    log("deployed")
    log("-------------------------------------")
}

//this can help us ONLY run this if we wanted to, by adding a tag, we can do somehting like
//yarn hardhat deploy --tag mocks
module.exports.tags = ["all", "mocks"]
