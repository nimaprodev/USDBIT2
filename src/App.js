import rewardImg from "./assets/images/reward.png";
import walletMoney from "./assets/images/wallet-money.svg";
import referralImg from './assets/images/referral.png'
import clipboard from './assets/images/clipboard.svg'
import totalCommissionImg from './assets/images/total_commissions.png'
import arrowRight from './assets/images/arrow-right.svg'
import group from './assets/images/group.svg'
import heroImg from './assets/images/hero.png'
import logo from './assets/images/logo.svg'
import trendUp from './assets/images/trend-up.svg';
import footer from './assets/images/footer.png'
import footerLogo from './assets/images/footer-logo.svg'
import telegram from './assets/images/telegram.svg'
import {ConnectWalletClient} from "./config.js";
import loadingDirective from './directives/loading.js';
import {useToast} from "vue-toast-notification";
import 'vue-toast-notification/dist/theme-sugar.css';
import {
    approveUSDT,
    deposit,
    getAllowance,
    getBalance,
    getTotalProfit,
    getUserDeposits,
    getUserInfo,
    withdrawProfit
} from "./web3.js";
import {formatEther, parseEther} from "viem";

export default {
    directives: {
        loading: loadingDirective,
    },
    data() {
        return {
            // images
            rewardImg,
            walletMoney,
            referralImg,
            clipboard,
            totalCommissionImg,
            arrowRight,
            group,
            heroImg,
            logo,
            trendUp,
            footer,
            footerLogo,
            telegram,

            // component state
            isConnected: false,
            total_deposit: 0,
            total_withdraw: 0,
            amount: null,
            quickValues: ["10%", "25%", "50%", "75%", "MAX"],
            selected: null,
            balance: 0,
            isLoading: false,
            your_reward: 0,
            isWithdrawRewardLoading: false,
            referralLink: 'https://usdbit.com/ref/..,',
            totalCommissions: 0,
            isClaimingReferralReward: false,
            levels: [
                {name: 'Level 1', percent: 5, icon: group},
                {name: 'Level 2', percent: 3, icon: group},
                {name: 'Level 3', percent: 2, icon: group},
                {name: 'Level 4', percent: 1, icon: group}
            ]
        };
    },
    methods: {
        async fetchData() {
            const th = this
            if (!th.account) return;
            try {
                const account = th.account;

                th.balance = await getBalance(th.account);


                const user_data = await getUserInfo(account)
                if (user_data.referralCode === '0')
                    return

                this.available_commissions = formatEther(user_data.totalBonus)
                this.referralCode = user_data.referralCode
                this.totalReferralRewards = formatEther(user_data.totalReferralRewards)
                // this.totalReferrals = user_data[6]
                this.levelCounts = user_data.levelCounts


                const userDeposits = await getUserDeposits(th.account);
                this.userDeposits = userDeposits;
                const totalDeposits = Array(5).fill(BigInt(0));
                if (this.userDeposits.length)
                    for (let i = 0; i < userDeposits.length; i++) {
                        const planId = Number(userDeposits[i].planId);
                        const amount = BigInt(userDeposits[i].amount);
                        totalDeposits[planId] += amount;
                    }

                this.your_deposit = totalDeposits.map(amount => this.formatBNB(amount));

                this.your_mine = await getTotalProfit(th.account)
                let total_mine = 0n
                total_mine = this.your_mine.reduce((accumulator, currentValue) => accumulator + BigInt(currentValue), BigInt(0));
                this.total_mine = total_mine


            } catch (e) {
                console.error(e)
                if (e.hasOwnProperty("shortMessage"))
                    th.toast.error(e.shortMessage)
            }
        },

        async init() {
            const _self = this;
            try {
                await this.connectWallet();
                await this.fetchData();

                // Set up an interval to regularly fetch data
                window.setInterval(async () => {
                    await _self.fetchData();
                }, 10 * 1000);

                // Reload page if accounts change
                if (window.ethereum) {
                    window.ethereum.on('accountsChanged', function (accounts) {
                        window.location.reload();
                    });
                }
            } catch (e) {
                console.error('Initialization failed:', e);
                if (e.shortMessage) {
                    this.toast.error(e.shortMessage);
                }
            }
        },

        getShortAddress(account) {
            const prefixLength = 5;
            if (!account)
                return
            if (account === '0x0000000000000000000000000000000000000000')
                return 'N/A'

            if (account.length <= prefixLength * 2 + 3) {
                return this.account;
            }
            const prefix = account.substring(0, prefixLength + 2);
            const suffix = account.substring(account.length - prefixLength);

            return prefix + '...' + suffix;
        },
        shortAddress() {
            if (!this.account) return
            return this.getShortAddress(this.account);

        },
        async connectWallet() {
            const th = this;
            try {
                this.client = await ConnectWalletClient()

                const accounts = await this.client.requestAddresses()

                this.isConnected = true;

                this.account = accounts[0]
            } catch (ex) {
                th.toast.error(ex.message)
            }

        },

        formatDisplayNumber(num, precision = 2) {
            if (num === null || num === undefined) return '0.00';
            return parseFloat(num).toFixed(precision);
        },
        selectValue(item) {
            this.selected = item;
            if (item === "MAX") {
                this.amount = this.balance;
            } else if (item.endsWith("%")) {
                const percentage = parseInt(item);
                const calculatedAmount = parseFloat(this.balance) * percentage / 100;
                this.amount = calculatedAmount;
            }
        },
        async doDeposit() {
            if (!this.amount || parseFloat(this.amount) <= 0) {
                this.toast.error("Please enter a valid amount.");
                return;
            }

            if (parseFloat(this.amount) < 20) {
                this.toast.error("Minimum deposit is 20 USDT.");
                return;
            }

            if (parseFloat(this.amount) > parseFloat(this.balance)) {
                this.toast.error("Insufficient balance.");
                return;
            }

            this.isLoading = true;
            try {
                const urlParams = new URLSearchParams(window.location.search);
                const refCode = urlParams.get('ref') || '0';
                const depositAmount = parseEther(this.amount.toString());

                const allowance = await getAllowance(this.account);
                if (allowance < depositAmount) {
                    this.toast.info("Waiting for approval...");
                    await approveUSDT(this.account);
                }

                this.toast.info("Processing deposit...");
                await deposit(this.account, 0, refCode, this.amount.toString());

                this.toast.success("Deposit successful!");
                await this.fetchData(); // Refetch all data
                this.amount = null;
                this.selected = null;
            } catch (e) {
                console.error(e);
                if (e.hasOwnProperty("shortMessage")) {
                    this.toast.error(e.shortMessage);
                } else {
                    this.toast.error("An error occurred during deposit.");
                }
            } finally {
                this.isLoading = false;
            }
        },
        withdrawReward() {
            console.log('Withdrawing reward');
            // Your withdraw reward logic here
        },
        copyToClipboard() {
            this.$copyText(this.referralLink).then(() => {
                this.$toast.success('Referral link copied to clipboard!');
            }, () => {
                this.$toast.error('Failed to copy referral link.');
            });
        },
        claimReferral() {
            console.log('Claiming referral reward');
            // Your claim referral logic here
        }
    },
    setup() {
        const truncateZeroes = (value) => {
            if (!value || value.toString() === '0') return 0
            const regex = /\.?0+$/;
            return value.replace(regex, '');
        };

        const toast = useToast();

        const {address, isConnected} = useAccount();

        const your_reward = ref(0);
        const userInfo = ref(null);
        const total_deposit = ref(0);
        const total_withdraw = ref(0);
        const referralCode = ref(null);
        const totalCommissions = ref(0);


        const {data: totalProfitData, refetch: refetchTotalProfit} = useReadContract({
            abi: usdbitABI,
            address: usdbitContractAddress,
            functionName: 'getUserDividends',
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
                refetchInterval: 20000, // Refetch every 20 seconds

            }
        });


        watch(totalProfitData, (newVal) => {
            if (newVal) {
                your_reward.value = formatEther(newVal);
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
                referralCode.value = null;
                totalCommissions.value = '0.00';
            }
        });


        watch(userInfoData, (newVal) => {
            if (newVal) {
                userInfo.value = newVal;
                referralCode.value = newVal[1].toString();
                total_deposit.value = formatEther(newVal[4]);
                total_withdraw.value = formatEther(newVal[5]);
                totalCommissions.value = formatEther(newVal[6]);
            }
        })


        return {
            toast,
            truncateZeroes,
            your_reward,
            total_deposit,
            total_withdraw,
            referralCode,
            totalCommissions
        }

    },

    async mounted() {
        const _self = this;
        window.addEventListener('load', async () => {
            await _self.init();
        });

        window.setInterval(async () => {
            await _self.fetchData();
        }, 10 * 1000);

    },
}