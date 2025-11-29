
import {ref, computed, watch} from 'vue';
import {useAccount, useReadContract, useWriteContract} from '@wagmi/vue';
import {usdbitABI} from '../contracts/abi';
import {usdbitContractAddress} from '../contracts/usdbit';
import { formatDisplayNumber } from '../utils/format.js';
import { useToast } from 'vue-toast-notification';
import loadingDirective from '../directives/loading.js';

export function useUser() {
    const {address, isConnected} = useAccount();
    const toast = useToast();
    const vLoading = loadingDirective;

    const userInfo = ref(null);
    const total_deposit = ref('0.00');
    const total_withdraw = ref('0.00');
    const your_reward = ref('0.00');

    const {writeContractAsync: withdrawRewardAsync} = useWriteContract();

    const isWithdrawRewardLoading = ref(false);

    const withdrawReward = async () => {
        if (parseFloat(your_reward.value) <= 0) {
            toast.warning('No profit to withdraw');
            return;
        }
        isWithdrawRewardLoading.value = true;
        try {
            toast.info('Withdrawing reward...');
            await withdrawRewardAsync({
                abi: usdbitABI,
                address: usdbitContractAddress,
                functionName: 'withdrawPlanProfit',
            });
            toast.success('Reward withdrawn successfully!');
            refetchUserInfo();
        } catch (error) {
            console.error("Withdraw failed:", error);
            toast.error(error.shortMessage || "Withdraw failed. Please try again.");
        } finally {
            isWithdrawRewardLoading.value = false;
        }
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
        your_reward.value = (newVal);
    });

    watch(userInfoData, (newVal) => {
        userInfo.value = newVal; // Cache the data
        if (newVal) {
            total_deposit.value = (newVal[9]);
            total_withdraw.value = (newVal[10]);
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
        total_deposit.value = (userInfo.value[9]);
        total_withdraw.value = (userInfo.value[10]);
    }

    return {
        total_deposit,
        total_withdraw,
        your_reward,
        refetchUserInfo,
        refetchUserInfo,
        formatDisplayNumber,
        withdrawReward,
        isWithdrawRewardLoading,
        vLoading,
    };
}
