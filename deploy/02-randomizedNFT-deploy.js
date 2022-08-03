const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const { storeImages, storeTokenUriMetadata } = require("../utils/uploadToPinata")

let tokenUris = [
    "ipfs://QmaVkBn2tKmjbhphU7eyztbvSQU5EXDdqRyXZtRhSGgJGo",
    "ipfs://QmYQC5aGZu2PTH8XzbJrbDnvhj3gVs7ya33H9mqUNvST3d",
    "ipfs://QmZYmH5iDbD6v3U2ixoVAjioSzvWJszDzYdbeCLquGSpVm",
]

const metaDataTemplate = {
    name: "",
    description: "",
    image: "",
    attributes: [
        {
            trait_types: "cuteness",
            value: 100,
        },
    ],
} //this is for the metadata of the images

module.exports = async function ({ deployments, getNamedAccounts }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainID = network.config.chainId

    let VRfaddress
    let subID

    const fundamount = await ethers.utils.parseUnits("10")

    if (process.env.UPLOAD_TO_PINDATA == "true") {
        tokenUris = await handleTokenUris() //this function uploads our code to pinaata
    }

    if (chainID == 31337) {
        log("local network detected, deploying to local network")
        const mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
        VRfaddress = mock.address
        //create subscrioption
        console.log(`got vrf address! ${mock.address}`)
        const tx = await mock.createSubscription()
        const receipt = await tx.wait(1)
        subID = receipt.events[0].args.subId //it emits an event
        //fund it ...
        await mock.fundSubscription(subID, fundamount)
        console.log(`subscription created and funded`)
    } else {
        VRfaddress = networkConfig[chainID]["vrfCoordinator"]
        subID = networkConfig[chainID]["subscriptionID"]
    }

    log("--------------------------------")

    //for the images, we need the ipfs hashes programattically
    /*

        1. with our own IPFS node (manually) https://docs.ipfs.io
        2. use pinata  https://www.pinata.cloud
        3. NFT.storage  https://www.nft.storage  an entire network pinning your data

    */

    console.log("getting args...........")
    const arguments = [
        VRfaddress,
        subID,
        networkConfig[chainID]["callbackGasLimit"],
        networkConfig[chainID]["gasLane"],
        tokenUris,
        networkConfig[chainID]["mintFee"],
    ]

    console.log(`deploying contract with args`)
    console.log(`deployer addresss = ${deployer}`)

    //randomlpfsNft
    const randomIpfsNft = await deploy("randomlpfsNft", {
        from: deployer,
        args: arguments,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (chainID != 31337 && process.env.ETH_API_KEY) {
        console.log(`verifying ! with nft address ${randomIpfsNft.address}`)
        verify(randomIpfsNft.address, arguments)
        console.log(`verified`)
    }
}

async function handleTokenUris() {
    tokenUris = []
    //store image in ipfs --> done with store images

    const { reponses: imageUpLoadResponses, files } = await storeImages("./images/randomnft")
    console.log("stored images!")
    //store metadata in ipfs

    //from te reponses , we have the hash of all the uploaded files

    for (responseIndex in imageUpLoadResponses) {
        //create meta data
        //uplload metadata
        let metadata = { ...metaDataTemplate }
        metadata.name = files[responseIndex].replace(".png", "")
        metadata.description = `an adorable ${metadata.name}`
        metadata.image = `ipfs://${imageUpLoadResponses[responseIndex].IpfsHash}`
        console.log(`uploading ${metadata.name}`)
        //now we need to store JSON to pinata
        const metaDataUpLoadResponse = await storeTokenUriMetadata(metadata)
        tokenUris.push(`ipfs://${metaDataUpLoadResponse.IpfsHash}`) //this is the ipfs hashes that points to the metadata\
    }

    console.log(`uploaded`)
    console.log(tokenUris)
    return tokenUris
}

module.exports.tags = ["all", "randomipfs", "main"]
