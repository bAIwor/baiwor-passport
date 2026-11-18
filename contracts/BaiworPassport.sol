// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @notice Baiwor Passport NFT: 1 free mint per Agent ID holder, soulbound.
contract BaiworPassport is ERC721, Ownable {
    // Agent ID registry on BSC mainnet (SPACE ID Agent ID, ERC-721, non-transferable)
    address public constant AGENT_ID = 0x60B9262456dE011F7d15a54CdD8c48bAaa8B022F;

    uint256 public nextTokenId;
    string private _baseTokenURI;
    mapping(address => bool) public hasMinted;
    mapping(uint256 => uint256) public mintedAt;

    event Minted(address indexed minter, uint256 indexed tokenId, uint256 mintedAt);
    event BaseURIUpdated(string baseURI);

    constructor() ERC721("Baiwor Passport", "BWP") Ownable(msg.sender) {}

    function setBaseURI(string calldata baseURI_) external onlyOwner {
        _baseTokenURI = baseURI_;
        emit BaseURIUpdated(baseURI_);
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    /// @notice Free mint: caller must hold an Agent ID, 1 mint per address.
    function mint() external {
        require(!hasMinted[msg.sender], "already minted");
        require(IAgentID(AGENT_ID).balanceOf(msg.sender) > 0, "no Agent ID");

        uint256 tokenId = nextTokenId++;
        hasMinted[msg.sender] = true;
        mintedAt[tokenId] = block.timestamp;
        _safeMint(msg.sender, tokenId);
        emit Minted(msg.sender, tokenId, block.timestamp);
    }

    /// @dev Soulbound: minting (token does not exist yet) is allowed, transfers are not.
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        require(_ownerOf(tokenId) == address(0), "soulbound: transfers disabled");
        return super._update(to, tokenId, auth);
    }
}

interface IAgentID {
    function balanceOf(address owner) external view returns (uint256);
}
