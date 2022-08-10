const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
fs = require("fs")
module.exports = async function ({ deployments, getNamedAccounts }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainID = network.config.chainId
    let ethUSDpriceUsdAddress
    if (chainID == 31337) {
        //deploy mock
        const ethUSDaggregator = await ethers.getContract("MockV3Aggregator", deployer)
        ethUSDpriceUsdAddress = ethUSDaggregator.address
    } else {
        ethUSDpriceUsdAddress = networkConfig[chainID]["aggregatorV3Interface"]
    }

    //how to get low and high svg?
    //read it from our images folder
    log("------------------------")
    const lowSVG = await fs.readFileSync("./images/dynamicnft/frown.svg", { encoding: "utf8" })
    const highSVG = await fs.readFileSync("./images/dynamicnft/happy.svg", { encoding: "utf8" })
    /*
            address pricefeed,
        string memory lowsvg,
        string memory higsvg
    */
    const args = [ethUSDpriceUsdAddress, lowSVG, highSVG]
    const dynamicSvgNft = await deploy("DynamicSvgNft", {
        from: deployer,
        log: true,
        args: args,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (chainID != 31337 && process.env.ETH_API_KEY) {
        log("verifying")
        verify(dynamicSvgNft.address, args)
    }

    log("deployed!!!")

    log("--------------")
}

module.exports.tags = ["all", "dynamicSvg"]
