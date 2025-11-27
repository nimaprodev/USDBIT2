
export const usdbitContractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

export const usdbitABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "userInfo",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "total_deposit",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "total_withdraw",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export const usdtTokenAddress = '0x472a11E85c992fECC4C36B3B417935821F68F753';

export const usdtTokenABI = [
    {
        "constant": true,
        "inputs": [
            {
                "name": "_owner",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "name": "balance",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }
];
