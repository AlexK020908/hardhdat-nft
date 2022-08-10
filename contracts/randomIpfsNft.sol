//SPDX-License-Identifier:MIT
pragma solidity ^0.8.7;
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
//import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
error randomlpfsNft__RangeOutOfBounds();
error needMoreFunds();
error not_onwer();

contract randomlpfsNft is VRFConsumerBaseV2, ERC721URIStorage {
    //types

    enum Breed {
        PUG,
        SHIBA_INU,
        ST_BERNARD
    }
    VRFCoordinatorV2Interface private immutable I_COORDINATOR;
    uint64 private immutable i_subID;
    uint16 private constant c_requestConfirmations = 3;
    uint32 private immutable i_callbackGasLimit;
    bytes32 private immutable i_gasLane;
    uint256 internal immutable i_fee;
    mapping(uint256 => address) map;
    uint256 public s_tokenCounter;
    uint256 internal constant MAX_CHANCE_VALUE = 100;
    string[] internal s_dogTokenUris;
    address private immutable i_onwer;

    //different nft have diff rarities
    //pug --> lengendary
    //shiba --> rare
    //bernard common

    //users have to pay for nft
    //onwer of contract can withdraw eth
    event NFTRequested(uint256 indexed requestId, address sender);
    event NftMinted(Breed dogBreed, address onwer);

    constructor(
        address VRFCoordinatorV2,
        uint64 subId,
        uint32 callbackGasLimit,
        bytes32 gasLane,
        string[3] memory dogTokenUris,
        uint256 mintFee
    ) VRFConsumerBaseV2(VRFCoordinatorV2) ERC721("Random IPFS NFT", "R") {
        I_COORDINATOR = VRFCoordinatorV2Interface(VRFCoordinatorV2);
        i_subID = subId;
        i_callbackGasLimit = callbackGasLimit;
        i_gasLane = gasLane;
        s_dogTokenUris = dogTokenUris;
        i_fee = mintFee;
        i_onwer = msg.sender;
    }

    function requestNft() public payable returns (uint256 requestId) {
        if (msg.value < i_fee) revert needMoreFunds();
        requestId = I_COORDINATOR.requestRandomWords(
            i_gasLane,
            i_subID,
            c_requestConfirmations,
            i_callbackGasLimit,
            1
        );
        map[requestId] = msg.sender;
        emit NFTRequested(requestId, msg.sender);
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        address dogOwner = map[requestId];
        uint256 newItemId = s_tokenCounter;
        s_tokenCounter = s_tokenCounter + 1;
        uint256 moddedRng = randomWords[0] % MAX_CHANCE_VALUE;
        Breed dogBreed = getBreedFromModdedRNG(moddedRng);
        _safeMint(dogOwner, newItemId);
        _setTokenURI(newItemId, s_dogTokenUris[uint256(dogBreed)]);
        emit NftMinted(dogBreed, dogOwner);
    }

    // //since we need a random nummber --> use yarn to add chainlink->then import it
    // function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
    //     //we can not call safemint here because it wil give it to the chainlink, instead we want a mapping... requestid -> address
    //     address onwer = map[requestId];
    //     uint256 newTokenId = s_tokenCounter;
    //     uint256 moddedRNG = randomWords[0] % MAX_CHANCE_VALUE;
    //     //if the moded value is 0 --> in btw 0 and 10 we get pug
    //     //if the modded value if 12 --> we get a shiba --> btw 10 and 30 ...
    //     Breed breed = getBreedFromModdedRNG(moddedRNG);
    //     s_tokenCounter++;
    //     _setTokenURI(newTokenId, s_dogTokenUris[uint256(breed)]);
    //     _safeMint(onwer, newTokenId);

    //     emit NFTminted(breed, onwer);
    // }

    function withdraw() public onlyOnwer {
        (bool callSucess, ) = payable(i_onwer).call{value: address(this).balance}("");
        require(callSucess, "call failed");
    }

    function getBreedFromModdedRNG(uint256 moddedRNG) public pure returns (Breed) {
        uint256 sumsf = 0;
        uint256[3] memory chanceArray = getChangeArray();

        for (uint256 i = 0; i < chanceArray.length; i++) {
            if (moddedRNG >= sumsf && moddedRNG < sumsf + chanceArray[i]) {
                return Breed(i);
            } else {
                sumsf += chanceArray[i];
            }
        }

        revert randomlpfsNft__RangeOutOfBounds();
    }

    function getChangeArray() public pure returns (uint256[3] memory) {
        return [10, 30, MAX_CHANCE_VALUE];
        //this arrry means
        //index 0 --> 10 % change
        //index 1 --> 30 - 10 = 20 %
        //index 2 --> 60 %
    }

    // function tokenURI(
    //     uint256 /*tokenId*/
    // ) public pure override returns (string memory) {}

    modifier onlyOnwer() {
        if (msg.sender != i_onwer) {
            revert not_onwer();
        }

        _;
    }

    function getMintFee() public view returns (uint256) {
        return i_fee;
    }

    function getDogTokenUris(uint256 index) public view returns (string memory) {
        return s_dogTokenUris[index];
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }

    function getGaslane() public view returns (bytes32) {
        return i_gasLane;
    }
}
