// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @notice A contract that stores activities
 */
contract Activity is ERC721Enumerable, Ownable {
    using Counters for Counters.Counter;

    enum CheckInRequirement {
        OnlyOwner,
        Everyone
    }

    struct Params {
        string description;
        CheckInRequirement checkInRequirement;
        uint color;
    }

    Counters.Counter private _counter;
    mapping(uint => Params) private _params;
    mapping(uint => uint[]) private _checkIns;
    mapping(uint => mapping(uint => address[])) private _reactions;

    constructor() ERC721("Consistency Space - Activities", "CSA") {}

    /// **************************
    /// ***** USER FUNCTIONS *****
    /// **************************

    function create(
        string memory description,
        CheckInRequirement checkInRequirement,
        uint color
    ) public {
        // Update counter
        _counter.increment();
        // Mint token
        uint newTokenId = _counter.current();
        _mint(msg.sender, newTokenId);
        // Set params
        Params memory tokenParams = Params(
            description,
            checkInRequirement,
            color
        );
        _params[newTokenId] = tokenParams;
    }

    function checkIn(uint tokenId) public {
        // Checks
        require(_exists(tokenId), "Invalid token ID");
        if (
            _params[tokenId].checkInRequirement ==
            CheckInRequirement.OnlyOwner &&
            _ownerOf(tokenId) != msg.sender
        ) {
            revert("Not owner");
        }
        // Add check-in
        _checkIns[tokenId].push(block.timestamp);
    }

    function addReaction(uint tokenId, uint reactionId) public {
        // Checks
        require(_exists(tokenId), "Invalid token ID");
        for (uint i; i < _reactions[tokenId][reactionId].length; i++) {
            if (_reactions[tokenId][reactionId][i] == msg.sender) {
                revert("Already added");
            }
        }
        // Add reaction
        _reactions[tokenId][reactionId].push(msg.sender);
    }

    /// ***********************************
    /// ***** EXTERNAL VIEW FUNCTIONS *****
    /// ***********************************

    function getCurrentCounter() public view returns (uint) {
        return _counter.current();
    }

    function getParams(uint tokenId) public view returns (Params memory) {
        return _params[tokenId];
    }

    function getCheckIns(uint tokenId) public view returns (uint[] memory) {
        return _checkIns[tokenId];
    }

    function getReactions(
        uint tokenId,
        uint reactionId
    ) public view returns (address[] memory) {
        return _reactions[tokenId][reactionId];
    }

    /// ******************************
    /// ***** INTERNAL FUNCTIONS *****
    /// ******************************

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId,
        uint256 batchSize
    ) internal virtual override(ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
        // Disable transfers except minting
        if (from != address(0)) revert("Token not transferable");
    }
}
