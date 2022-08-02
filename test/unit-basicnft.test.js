const { developmentChains } = require("../helper-hardhat-config")
const { ethers, getNamedAccounts, network, deployments } = require("hardhat")
const { assert } = require("chai")

!developmentChains.includes("hardhat")
    ? describe.skip
    : describe("basic NFT uint test", function () {
          //a before each that deploys the contract
          let basicnft, deployer

          beforeEach(async () => {
              accounts = await ethers.getSigners()
              deployer = accounts[0]
              await deployments.fixture(["all"])
              basicnft = await ethers.getContract("basicNFT")
          })
          it("contructor sets counter correctly", async function () {
              const countervalue = await basicnft.getTokenCounter()
              assert.equal(countervalue.toString(), "0")
          })

          it("alloows to mint nft and updats acoordingly", async function () {
              await basicnft.mintNft()
              const newcounter = await basicnft.getTokenCounter()
              assert.equal(newcounter.toString(), "1")
          })
      })
