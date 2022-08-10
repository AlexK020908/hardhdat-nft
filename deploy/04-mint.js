const { ethers, network } = require("hardhat")
const { networkConfig } = require("../helper-hardhat-config")
module.exports = async function ({ getNamedAccounts }) {
    const { deployer } = await getNamedAccounts()
    const chainID = network.config.chainId
    //we are gonna mint
    const basicNft = await ethers.getContract("basicNFT", deployer)
    const tx = await basicNft.mintNft()
    await tx.wait(1)
    console.log(`basic nft index 0 has token uri ${await basicNft.tokenURI(0)}$`)

    const randomipfsNft = await ethers.getContract("randomlpfsNft", deployer)
    const mintfee = await randomipfsNft.getMintFee()
    //now we need to wait for the request to finish
    await new Promise(async (resolve, reject) => {
        setTimeout(resolve, 500000)
        randomipfsNft.once("NftMinted", async function () {
            try {
                resolve()
            } catch (error) {
                console.error(error)
                reject()
            }
        })

        const tx2 = await randomipfsNft.requestNft({ value: mintfee.toString() })
        const receipt = await tx2.wait(1)
        if (chainID == 31337) {
            //we pretent to be the mock
            log("local network founded for mint deploy script!!!")
            const requestId = receipt.events[1].args.requestId.toString()
            const mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)

            await mock.fulfillRandomWords(requestId, randomipfsNft.address)
        }
    })
    console.log("random ipfs nft minted!")

    const highvalue = ethers.utils.parseEther("4000")
    const dynamicnft = await ethers.getContract("DynamicSvgNft", deployer)
    const tx3 = await dynamicnft.mintNft(highvalue.toString())
    await tx3.wait(1)
}
