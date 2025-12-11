import {createPublicClient, createWalletClient, custom, http} from 'viem'
import {erc20_abi, usdbitABI} from './contracts/abi.js';
//import {bscTestnet as bsc} from "viem/chains";
import {bsc} from "viem/chains";

export const CHAIN = bsc;

export const CONTRACT_ADDRESS = "0xb4552f5B22511c45dD4DF6EC1fF4E957e8960E53";
export const USDT_CONTRACT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";


export const getInPageProviderName = () => {
  const provider = window.ethereum || window.web3?.currentProvider;

  if (!provider) return 'Browser';

  if (provider.isMathWallet) return 'Math Wallet';
  if (provider.isSafePal) return 'SafePal';
  if (provider.isTokenPocket) return 'TokenPocket';
  if (provider.isMetaMask) return 'MetaMask';
  if (provider.isStatus) return 'Status';
  if (provider.isImToken) return 'imToken';
  if (provider.isTrust) return 'Trust';
  if (provider.isToshi) return 'Coinbase';
  if (provider.isTokenary) return 'Tokenary';
  if (navigator.userAgent.match(/Opera|OPR/)) return 'Opera';

  return 'Browser';
};

const provider = window.ethereum || window.web3?.currentProvider;

let transport;
if (provider) {
    transport = custom(provider);
} else {
    // Fallback to a public RPC if no provider is found
    transport = http();
}


export async function ConnectWalletClient() {
    const currentProvider = window.ethereum || window.web3?.currentProvider;
    if (!currentProvider) {
        throw new Error('No compatible wallet detected. Please use a dApp browser like MetaMask or TrustWallet.');
    }

    const net_version = await currentProvider.request({method: 'net_version'})
    if (parseInt(net_version) !== parseInt(CHAIN.id)) {

        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{chainId: `0x${CHAIN.id.toString(16)}`}]
            });
        } catch {
            throw new Error(`Please switch to ${CHAIN.name} chain.`);
        }

    }

    return createWalletClient({
        chain: CHAIN,
        transport: custom(currentProvider),
    });
}

export const publicClient = createPublicClient({
    chain: CHAIN,
    transport: transport,
});

export const ABI = usdbitABI;
export const USDT_ABI = erc20_abi;
