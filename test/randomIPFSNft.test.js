//need chainId,
const { ethers, network, getNamedAccounts, deployments } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { assert, expect } = require("chai")

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
              console.log("finished getting mock contract")
          })

          it("constructor sets everything properly", async function () {
              const gaslane = await randomIpfsNFT.getGaslane()
              assert.equal(gaslane, networkConfig[31337]["gasLane"])

              const mint_fee = await randomIpfsNFT.getMintFee()
              assert.equal(mint_fee, networkConfig[chainID]["mintFee"])
              console.log("constructor sets everything correctly ")
          })

          describe("requestNft", () => {
              it("request nft fails with not enough money", async function () {
                  expect(randomIpfsNFT.requestNft()).to.be.reverted
              })
              it("emits an event and kicks off a random word request", async function () {
                  const fee = await randomIpfsNFT.getMintFee()

                  await expect(randomIpfsNFT.requestNft({ value: fee.toString() })).to.emit(
                      randomIpfsNFT,
                      "NFTRequested"
                  )
              })
              console.log("request nft is correct")
          })

          describe("fulfillRandomWords", () => {
              it("mints NFT after random number is returned", async function () {
                  await new Promise(async (resolve, reject) => {
                      randomIpfsNFT.once("NftMinted", async () => {
                          console.log("found the event !")
                          try {
                              const tokenUri = await randomIpfsNFT.tokenURI("0")
                              //note that we can call tokenURI becuase it is included already
                              //we just didn't override it

                              // function tokenURI(
                              //     uint256 /*tokenId*/
                              // ) public pure override returns (string memory) {}

                              const tokenCounter = await randomIpfsNFT.getTokenCounter()
                              assert.equal(tokenUri.toString().includes("ipfs://"), true)
                              assert.equal(tokenCounter.toString(), "1")
                              resolve()
                          } catch (e) {
                              console.log(e)
                              reject(e)
                          }
                      })
                      try {
                          const fee = await randomIpfsNFT.getMintFee()
                          const requestNftResponse = await randomIpfsNFT.requestNft({
                              value: fee.toString(),
                          })
                          const requestNftReceipt = await requestNftResponse.wait(1)
                          await VRFCoordinatorV2Mock.fulfillRandomWords(
                              requestNftReceipt.events[1].args.requestId,
                              randomIpfsNFT.address
                          )
                          console.log("waiting for event ")
                      } catch (e) {
                          console.log(e)
                          reject(e)
                      }
                  })
              })
          })

          describe("withdraw", function () {
              it("only onwer can withdraw funds", async function () {
                  const signers = await ethers.getSigners()
                  const newcontract = randomIpfsNFT.connect(signers[1])
                  expect(newcontract.withdraw()).to.be.reverted
              })
          })
      })
