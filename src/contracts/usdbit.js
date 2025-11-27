
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

export const usdtTokenAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';

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
