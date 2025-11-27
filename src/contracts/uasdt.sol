// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

//0x472a11E85c992fECC4C36B3B417935821F68F753
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract BinancePegBSCUSD is ERC20, ERC20Burnable, Ownable, ERC20Permit {
    constructor()
    ERC20("Binance-Peg BSC-USD", "BSC-USD")
    Ownable(msg.sender)
    ERC20Permit("Binance-Peg BSC-USD")
    {
        _mint(msg.sender, 9999999999999999999 * 10 ** decimals());
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function decimals() public view virtual override returns (uint8) {
        return 18;
    }
}