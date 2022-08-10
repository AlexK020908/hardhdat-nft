//SPDX-License-Identifier:MIT
pragma solidity ^0.8.7;

//DynamicSvgNft.sol gives different nfts based on stats
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "base64-sol/base64.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract DynamicSvgNft is ERC721 {
    //mint function
    //storing svg info
    //some logic to say "show X image" or show Y image ---> switching token uri
    //we know that this is an erc721 to start
    uint256 private s_tokenCounter;
    string private i_low_imageURI;
    string private i_high_imageURI;
    AggregatorV3Interface internal immutable i_pricefeed;
    string private constant base64Prefix = "data:image/svg+ml;base64,";
    mapping(uint256 => int256) public s_tokenIdToHighValue;
    event createdNFT(uint256 indexed tokencounter, int256 indexed highvalue);

    constructor(
        address pricefeed,
        string memory lowsvg,
        string memory higsvg
    ) ERC721("dynamic svg nft", "DSN") {
        s_tokenCounter = 0;
        i_low_imageURI = svgToImageURI(lowsvg);
        i_high_imageURI = svgToImageURI(higsvg);
        i_pricefeed = AggregatorV3Interface(pricefeed);
    }

    function svgToImageURI(string memory svg) public pure returns (string memory) {
        //we convert the svg to image uris instead of using ipfs
        //we give it an svg and return a string that is the base64 encoding url we just saw on https://base64.guru/converter/encode
        //we can use an already coded repo to encode and decode base 64
        //using yarn add --dev base64-sol
        string memory svgEncoded = Base64.encode(bytes(string(abi.encodePacked(svg))));
        //base64.encode is imported so we can encode the svg in bytes .... into base 64
        return string(abi.encodePacked(base64Prefix, svgEncoded)); //this is how you combine strings .....
        //now that we have the base64 encoded string
    }

    function mintNft(int256 highvalue) public {
        //we disregarded payable since we dont want users to pay for it
        s_tokenIdToHighValue[s_tokenCounter] = highvalue;
        _safeMint(msg.sender, s_tokenCounter);
        s_tokenCounter++;
        emit createdNFT(s_tokenCounter, highvalue);
    }

    function _baseURI() internal pure override returns (string memory) {
        return "data:application/json;base64,";
    }

    function tokenURI(uint256 tokenID) public view override returns (string memory) {
        require(_exists(tokenID), "URI Query for nonexistent token");
        //we want to make the tokenURI return a base64 encoded version of the json metadata
        // string memory imageURI = "image uri"; //whether we decide to give highsvg or low svg --> it depends on the price...
        (, int256 price, , , ) = i_pricefeed.latestRoundData();
        string memory imageURI = price >= s_tokenIdToHighValue[s_tokenCounter]
            ? i_high_imageURI
            : i_low_imageURI;
        return
            string(
                abi.encodePacked(
                    _baseURI(),
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":"',
                                name(), // You can add whatever name here
                                '", "description":"An NFT that changes based on the Chainlink Feed", ',
                                '"attributes": [{"trait_type": "coolness", "value": 100}], "image":"',
                                imageURI,
                                '"}'
                            )
                        )
                    )
                )
            );
    }
}
