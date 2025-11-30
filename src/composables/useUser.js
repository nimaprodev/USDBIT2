import {ref, computed, watch} from 'vue';
import {useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract} from '@wagmi/vue';
import {usdbitABI} from '../contracts/abi';
import {usdbitContractAddress} from '../contracts/usdbit';
import {formatDisplayNumber} from '../utils/format.js';
import {useToast} from 'vue-toast-notification';
import loadingDirective from '../directives/loading.js';

export function useUser() {
    const {address, isConnected} = useAccount();
    const toast = useToast();
    const vLoading = loadingDirective;

    const userInfo = ref(null);
    const total_deposit = ref('0.00');
    const referralCode = ref(null);
    const totalCommissions = ref('0.00');
    const total_withdraw = ref('0.00');
    const your_reward = ref('0.00');

    const {writeContractAsync: withdrawRewardAsync} = useWriteContract();
    const {writeContractAsync: claimReferralAsync} = useWriteContract();

    const isWithdrawRewardLoading = ref(false);
    const isClaimingReferralReward = ref(false);

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


    watch(isConnected, (connected) => {
        if (connected) {
            refetchUserInfo();
            refetchTotalProfit();
        } else {
            userInfo.value = null;
            your_reward.value = '0.00';
            total_deposit.value = '0.00';
            total_withdraw.value = '0.00';
            referralCode.value = null;
            totalCommissions.value = '0.00';
        }
    });


    watch(userInfoData, (newVal) => {
        if (newVal) {
            userInfo.value = newVal;
            referralCode.value = newVal[1].toString();
            totalCommissions.value = newVal[3];
            total_deposit.value =newVal[9];
            total_withdraw.value = newVal[10];
        }
    })

    const claimReferral = async () => {
        if (parseFloat(totalCommissions.value) <= 0) {
            toast.warning('No referral rewards to claim');
            return;
        }
        isClaimingReferralReward.value = true;
        try {
            toast.info('Claiming referral rewards...');
            await claimReferralAsync({
                abi: usdbitABI,
                address: usdbitContractAddress,
                functionName: 'claimReferralRewards',
            });

            toast.success('Referral rewards claimed successfully!');
            refetchUserInfo();
        } catch (error) {
            console.error("Claiming referral rewards failed:", error);
            toast.error(error.shortMessage || "Claiming failed. Please try again.");
        } finally {
            isClaimingReferralReward.value = false;
        }
    };

    return {
        total_deposit,
        total_withdraw,
        your_reward,
        refetchUserInfo,
        referralCode,
        formatDisplayNumber,
        withdrawReward,
        isWithdrawRewardLoading,
        vLoading,
        totalCommissions,
        claimReferral,
        isClaimingReferralReward
    };
}
