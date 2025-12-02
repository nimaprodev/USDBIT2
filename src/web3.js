import {
    BaseError,
    ContractFunctionRevertedError,
    createPublicClient,
    createWalletClient,
    custom,
    formatEther, getContractError,
    http, maxUint256,
    parseEther
} from 'viem';
import {
    ABI as contractABI,
    CONTRACT_ADDRESS,
    ConnectWalletClient,
    publicClient,
    USDT_ABI,
    USDT_CONTRACT_ADDRESS, ABI, CHAIN
} from "./config.js";


export async function getBalance(account) {
    try {
        const  balance = await publicClient.readContract({
            address: USDT_CONTRACT_ADDRESS,
            abi: USDT_ABI,
            functionName: 'balanceOf',
            args: [account]
        });
       return formatEther(balance)
    } catch (e) {
        return BigInt(0)
    }
}


export async function waitForTransactionReceipt(publicClient, approve_tx_id, timeout = 120000, retryCount = 5) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
        try {
            const receipt = await publicClient.getTransactionReceipt({hash: txHash});
            if (receipt) {
                console.log('Transaction Receipt:', receipt);
                return receipt;
            }
        } catch (error) {
            console.error('Error getting transaction receipt:', error);
        }
        // Wait for 2 seconds before trying again
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    throw new Error('Transaction receipt not found within timeout');
}


export async function getAllowance(owner) {
    return await publicClient.readContract({
        address: USDT_CONTRACT_ADDRESS,
        abi: USDT_ABI,
        functionName: 'allowance',
        args: [owner, CONTRACT_ADDRESS]
    });
}

export async function approveUSDT(account) {
    const client = await ConnectWalletClient();
    const {request} = await publicClient.simulateContract({
        account,
        address: USDT_CONTRACT_ADDRESS,
        abi: USDT_ABI,
        functionName: 'approve',
        args: [CONTRACT_ADDRESS, maxUint256]
    });
    const hash = await client.writeContract(request);
    return await publicClient.waitForTransactionReceipt({hash});
}


export async function deposit(account, planId, refCode, _amount) {
    const amount = parseEther(_amount)
    const client = await ConnectWalletClient();
    const {request} = await publicClient.simulateContract({
        account,
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: 'deposit',
        args: [amount, refCode]
    });
    const hash = await client.writeContract(request);
    return await publicClient.waitForTransactionReceipt({hash});
}


export async function withdrawCommissionsRequest(account) {
    try {
        const {request} = await publicClient.simulateContract({
            account,
            address: CONTRACT_ADDRESS,
            abi: contractABI,
            functionName: 'claimReferralRewards',
            args: [],
        });
    const client = await ConnectWalletClient();
        return await client.writeContract(request);
    } catch (error) {
        console.error('Withdraw error caught:', error);
        throw error;
    }

}

export async function withdrawProfit(account, depositIndex) {

    try {
        const client = await ConnectWalletClient();
        const {request} = await publicClient.simulateContract({
            account,
            address: CONTRACT_ADDRESS,
            abi: contractABI,
            functionName: 'withdrawProfit',
            args: [account],
        });
        return await client.writeContract(request);


    } catch (error) {
        console.error('Error in withdrawPlan:', error);

        if (error instanceof BaseError) {
            const revertError = error.walk((err) => err instanceof ContractFunctionRevertedError);
            if (revertError instanceof ContractFunctionRevertedError) {
                const errors = revertError.data?.args ?? [];
                throw new Error(errors[0]);
            }
        }
        throw error;
    }
}

export async function getUserInfo(account) {
    try {
        const result = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: ABI,
            functionName: 'getUserInfo',
            args: [account],
        });

        const userInfo = {
            id: result[0],
            referralCode: result[1],
            referrerCode: result[2],
            referrer: result[3],
            totalDeposit: result[4],
            totalWithdraw: result[5],
            totalBonus: result[6],
            totalReferralRewards: result[7],
        };


        for (let key in userInfo) {
            if (typeof userInfo[key] === 'bigint') {
                userInfo[key] = userInfo[key].toString();
            } else if (Array.isArray(userInfo[key])) {
                // Convert bigints inside the array to strings
                userInfo[key] = userInfo[key].map(val => typeof val === 'bigint' ? val.toString() : val);
            }
        }

        return userInfo;

    } catch (error) {
        console.error('Error in getUserInfo:', error);

        if (error instanceof BaseError) {
            const revertError = error.walk((err) => err instanceof ContractFunctionRevertedError);
            if (revertError instanceof ContractFunctionRevertedError) {
                const errors = revertError.data?.args;
                if (errors && errors.length > 0) {
                    throw new Error(errors[0]);
                }
            }
        }

        // fallback general error
        throw new Error('Failed to fetch user info.');
    }
}


export async function withdrawDividends(account, plan_id) {
    try {
        const client = await ConnectWalletClient();
        const publicClient = createPublicClient({
            chain: CHAIN,
            transport: http()
        });

        const {request} = await publicClient.simulateContract({
            account,
            address: CONTRACT_ADDRESS,
            abi: ABI,
            functionName: 'withdrawProfit',
        });

        return await client.writeContract(request);


    } catch (error) {
        console.error('Error in withdrawProfit:', error);

        if (error instanceof BaseError) {
            const revertError = error.walk((err) => err instanceof ContractFunctionRevertedError);
            if (revertError instanceof ContractFunctionRevertedError) {
                const errors = revertError.data?.args ?? [];
                throw new Error(errors[0]);
            }
        }
    }
}

export async function getTotalProfit(account, plan_id) {
    try {
        const result = await publicClient.readContract({
            account,
            address: CONTRACT_ADDRESS,
            abi: contractABI,
            functionName: 'getUserDividends',
            args: [account],
        });
        return formatEther(result);
    } catch (error) {
        console.error('Error in getTotalProfit:', error);
        if (error instanceof BaseError) {
            const revertError = error.walk((err) => err instanceof ContractFunctionRevertedError);
            if (revertError instanceof ContractFunctionRevertedError) {
                const errors = revertError.data?.args ?? [];
                console.log(errors)
                // throw new Error(errors[0]);
            }
        }
    }
}


export async function getTotalDeposited(account) {
    try {
        return await publicClient.readContract({
            account,
            address: CONTRACT_ADDRESS,
            abi: contractABI,
            functionName: 'getTotalDeposited',
            args: [account],
        });
    } catch (error) {
        if (error instanceof BaseError) {
            const revertError = error.walk((err) => err instanceof ContractFunctionRevertedError);
            if (revertError instanceof ContractFunctionRevertedError) {
                const errors = revertError.data?.args ?? [];
                throw new Error(errors[0]);
            }
        }
    }
}