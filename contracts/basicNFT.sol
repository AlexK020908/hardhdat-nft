//SPDX-License-Identifer: MIT
pragma solidity ^0.8.7;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract basicNFT is ERC721 {
    string public constant TOKEN_URI =
        "ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json";
    uint256 private s_tokenCounter;

    //below is the standard for NFT https://eips.ethereum.org/EIPS/eip-721
    //or we can use openzepplin!!!!
    /*

        yarn add --dev @openzeppelin/contracts
    */

    constructor() ERC721("doggie", "DOG") {
        s_tokenCounter = 0;
    }

    function mintNft() public returns (uint256) {
        ///check _safeMint function
        _safeMint(msg.sender, s_tokenCounter);
        s_tokenCounter++;
        return s_tokenCounter;
    }

    function tokenURI(
        uint256 /*tokenId*/
    ) public pure override returns (string memory) {
        return TOKEN_URI;
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }
}
