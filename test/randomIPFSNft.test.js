//need chainId,
const { ethers, network, getNamedAccounts, deployments } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { assert } = require("chai")

const chainID = network.config.chainId
console.log(`chianID is ${chainID}`)
chainID != 31337
    ? describe.skip
    : describe("random ipfs nft", function () {
          //first deploy the contract
          let randomIpfsNFT
          let deployer
          let VRFCoordinatorV2Mock
          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              console.log(`deploying all contracts`)
              await deployments.fixture(["all"])
              console.log(`getting random ipfs contract `)
              randomIpfsNFT = await ethers.getContract("randomlpfsNft")
              //need the vrf too I would suppose
              console.log(`getting mock contract `)
              VRFCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
          })

          it("constructor sets everything properly", async function () {
              const gaslane = await randomIpfsNFT.getGaslane()
              assert.equal(gaslane, networkConfig[31337]["gasLane"])
          })
      })
