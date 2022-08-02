const { loadFixture } = require("ethereum-waffle")
const { ethers, network } = require("hardhat")
const { verify } = require("../utils/verify")

module.exports = async function ({ deployments, getNamedAccounts }) {
    const { deployer } = await getNamedAccounts()
    const { log, deploy } = deployments
    const chainId = network.config.chainId
    log("======================")
    const args = []
    const basicNFT = await deploy("basicNFT", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    log("=============================")
    log("deployed!")

    if (chainId != 31337 && process.env.ETH_API_KEY) {
        log("---verifying----")
        verify(basicNFT.address, args)
    }
}

module.exports.tags = ["all", "basicNFT"]
