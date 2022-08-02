const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const { storeImages } = require("../utils/uploadToPinata")
module.exports = async function ({ deployments, getNamedAccounts }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainID = network.config.chainId
    let randomNFT
    let VRfaddress
    let subID
    const args = []
    const mintFee = await ethers.utils.parseEther("0.2")
    let tokenuris
    if (chainID == 31337) {
        log("local network detected, deploying to local network")
        const mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
        VRfaddress = mock.address
        //create subscrioption
        const tx = await mock.createSubscription()
        const receipt = await tx.wait(1)
        subID = receipt.events[0].args.subId //it emits an event
        //fund it ...
    } else {
        VRfaddress = networkConfig[chainID]["vrfCoordinator"]
        subID = networkConfig[chainID]["subscriptionID"]
    }

    log("--------------------------------")
    if (process.env.UPLOAD_TO_PINDATA == "true") {
        tokenuris = await handleTokenUris() //this function uploads our code to pinaata
    }
    //for the images, we need the ipfs hashes programattically
    /*

        1. with our own IPFS node (manually) https://docs.ipfs.io
        2. use pinata  https://www.pinata.cloud
        3. NFT.storage  https://www.nft.storage  an entire network pinning your data

    */
    await storeImages("./images/randomnft")
    console.log("store images")

    // const arguments = [
    //     networkConfig[chainID]["vrfCoordinator"],
    //     subID,
    //     networkConfig[chainID]["callbackGasLimit"],
    //     networkConfig[chainID]["gasLane"],
    //     /** the files in string format pointing to IPFS , */
    //     mintFee,
    // ]
    // randomNFT = await deploy("basicNFT", {
    //     from: deploy,
    //     log: true,
    //     args: args,
    //     waitConfirmations: network.config.blockConfirmations || 1,
    // })

    // if (chainId != 31337 && process.env.ETH_API_KEY) {
    //     verify(randomNFT.address, args)
    // }
}

async function handleTokenUris() {
    tokenUris = []
    //store image in ipfs
    //store metadata in ipfs
    return tokenuris
}

module.exports.tags = ["all", "randomipfs"]
