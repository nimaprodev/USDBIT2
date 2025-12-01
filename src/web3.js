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
import {ABI, CHAIN, ConnectWalletClient, CONTRACT_ADDRESS, USDT_ABI, USDT_CONTRACT_ADDRESS} from './config.js';

const transport = typeof window.ethereum !== 'undefined' ? custom(window.ethereum) : http();

let client = createWalletClient({
    chain: CHAIN,
    transport: transport,
});

const contractAddress = CONTRACT_ADDRESS;
const contractABI = ABI;
export const publicClient = createPublicClient({
    chain: CHAIN,
    transport: transport,
});


// get BNB balance
export async function getBalance(account) {
    const balance = await publicClient.getBalance({
        address: account,
    });

    if (!balance) return BigInt(0);
    return balance;

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


export async function getUserDeposits(account) {
    try {

        const {result} = await publicClient.simulateContract({
            account,
            address: contractAddress,
            abi: contractABI,
            functionName: "getUserDeposits",
            args: [account]
        });

        const processedResult = result.map(array =>
            array.map(value => typeof value === 'bigint' ? value.toString() : value)
        );
        const [planIds, amounts, startTimes, ends] = processedResult;
        return planIds.map((_, index) => ({
            planId: planIds[index],
            amount: amounts[index],
            startTime: startTimes[index],
            end: ends[index]
        }));

    } catch (error) {
        console.error('Error in getUserDeposits:', error);
        // Return an empty array if there's an error
        return [];
    }
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
        args: [planId, amount, refCode]
    });
    const hash = await client.writeContract(request);
    return await publicClient.waitForTransactionReceipt({hash});
}


export async function withdrawCommissionsRequest(account) {
    try {
        const {request} = await publicClient.simulateContract({
            account,
            address: contractAddress,
            abi: contractABI,
            functionName: 'claimReferralRewards',
            args: [],
        });
        return await client.writeContract(request);
    } catch (error) {
        console.error('Withdraw error caught:', error);
        throw error;
    }

}

export async function withdrawPlan(account, depositIndex) {

    try {
        const client = await ConnectWalletClient();
        const {request} = await publicClient.simulateContract({
            account,
            address: contractAddress,
            abi: contractABI,
            functionName: 'withdrawPlan',
            args: [depositIndex],
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
            account,
            address: contractAddress,
            abi: contractABI,
            functionName: 'getUserInfo',
            args: [account],
        });

        const userInfo = {
            id: result[0],
            referralCode: result[1],
            referrerCode: result[2],
            totalBonus: result[3],
            referrer: result[4],
            totalReferralRewards: result[5],
            totalReferrals: result[6],
            levelCounts: result[7],
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
        const {request} = await publicClient.simulateContract({
            account,
            address: contractAddress,
            abi: contractABI,
            functionName: 'withdrawPlanProfit',
            args: [plan_id],
        });

        return await client.writeContract(request);


    } catch (error) {
        console.error('Error in withdrawDividends:', error);

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
            address: contractAddress,
            abi: contractABI,
            functionName: 'getTotalProfit',
        });
        const [_, profits] = result;
        return profits;
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
            address: contractAddress,
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