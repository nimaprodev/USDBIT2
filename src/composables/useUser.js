
import {ref, computed, watch} from 'vue';
import {useAccount, useReadContract} from '@wagmi/vue';
import {formatEther} from 'viem';
import {usdbitContractAddress} from '../contracts/usdbit.js';
import {usdbitABI} from "../contracts/abi.js";
import { formatDisplayNumber } from '../utils/format.js';

// A cache to hold user data and prevent re-fetching across components
const userInfo = ref(null);

export function useUser() {
    const {address, isConnected} = useAccount();

    const total_deposit = ref('0.00');
    const total_withdraw = ref('0.00');
    const your_reward = ref('0.00');

    const formatAndSetBigIntValue = (bigIntValue) => {
        if (bigIntValue) {
            return formatEther(bigIntValue);
        }
        return '0.00';
    };

    const {data: totalProfitData, refetch: refetchTotalProfit} = useReadContract({
        abi: usdbitABI,
        address: usdbitContractAddress,
        functionName: 'getTotalProfit',
        args: [address],
        query: {
            enabled: computed(() => isConnected.value && !!address.value),
            refetchInterval: 10000, // Refetch every 10 seconds
        }
    });

    const {data: userInfoData, refetch: refetchUserInfo} = useReadContract({
        abi: usdbitABI,
        address: usdbitContractAddress,
        functionName: 'getUserInfo',
        args: [address],
        query: {
            enabled: computed(() => isConnected.value && !!address.value),
            refetchInterval: 20000, // Refetch every 10 seconds

        }
    });

    watch(totalProfitData, (newVal) => {
        your_reward.value = formatAndSetBigIntValue(newVal);
    });

    watch(userInfoData, (newVal) => {
        userInfo.value = newVal; // Cache the data
        if (newVal) {
            total_deposit.value = formatAndSetBigIntValue(newVal[9]);
            total_withdraw.value = formatAndSetBigIntValue(newVal[10]);
        } else {
            total_deposit.value = '0.00';
            total_withdraw.value = '0.00';
        }
    });

    watch(isConnected, (connected) => {
        if (connected) {
            refetchUserInfo();
            refetchTotalProfit();
        } else {
            userInfo.value = null;
            your_reward.value = '0.00';
            total_deposit.value = '0.00';
            total_withdraw.value = '0.00';
        }
    });

    // If there's cached data, use it immediately
    if (userInfo.value) {
        total_deposit.value = formatAndSetBigIntValue(userInfo.value[9]);
        total_withdraw.value = formatAndSetBigIntValue(userInfo.value[10]);
    }

    return {
        total_deposit,
        total_withdraw,
        formatDisplayNumber,
        your_reward,
        refetchUserInfo,
    };
}
