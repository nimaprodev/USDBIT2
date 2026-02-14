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
    getUserInfo,
    getUserReferralLevelStats,
    withdrawCommissionsRequest,
    withdrawDividends,
    withdrawProfit
} from "./web3.js";
import {formatEther, parseEther} from "viem";
import {ref} from "vue";

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
            referralLink: 'Referral link activates after investment.',
            available_commissions: '0',
            isClaimingReferralReward: false,
            faqItems: [
                {
                    question: "What is USDBIT and which network does it run on?",
                    answer: "USDBIT is a USDT-based investment dApp running on BNB Chain (BSC). You interact using a wallet like MetaMask set to BNB Chain."
                },
                {
                    question: "What token do I deposit?",
                    answer: "You deposit USDT (BEP-20) on BNB Chain. The USDT contract used is: 0x55d398326f99059fF775485246999027B3197955."
                },
                {
                    question: "What is the minimum deposit?",
                    answer: "The minimum deposit is 20 USDT."
                },
                {
                    question: "How do I make my first deposit on the website?",
                    answer: "Open Dashboard/App, click Connect Wallet, enter your amount (>= 20 USDT), click Approve USDT (first time only) and confirm in wallet, then click Deposit and confirm in wallet."
                },
                {
                    question: "What is the daily ROI and how long does it last?",
                    answer: "Default ROI is 2.5% per day, and each deposit runs for 120 days. After 120 days, that deposit stops generating profit. The contract owner can change the daily ROI for future calculations."
                },
                {
                    question: "Can I withdraw my principal (initial deposit)?",
                    answer: "No. Principal is not withdrawable in this contract. Only profit and referral rewards can be withdrawn."
                },
                {
                    question: "How do I withdraw my daily profit on the website?",
                    answer: "On the Dashboard, go to Your Reward section, click Withdraw Now, and confirm the transaction in your wallet. Profit is based on time passed since your last profit withdrawal and your active deposits."
                },
                {
                    question: "How does the referral program work?",
                    answer: "USDBIT has an 8-level referral program: 5%, 3%, 2%, 1%, 0.5%, 0.2%, 0.2%, 0.1%. Copy your referral link/invite code, share it, and earn when your team deposits through your link/code."
                },
                {
                    question: "How do I withdraw referral rewards on the website?",
                    answer: "Referral rewards accumulate as bonus balance. Go to Total Commissions section, click Withdraw Now, and confirm in your wallet."
                },
            ],
            levels: [
                {name: 'Level 1', percent: 5, icon: group, downlineCount: 0, income: '0'},
                {name: 'Level 2', percent: 3, icon: group, downlineCount: 0, income: '0'},
                {name: 'Level 3', percent: 2, icon: group, downlineCount: 0, income: '0'},
                {name: 'Level 4', percent: 1, icon: group, downlineCount: 0, income: '0'},
                {name: 'Level 5', percent: 0.5, icon: group, downlineCount: 0, income: '0'},
                {name: 'Level 6', percent: 0.2, icon: group, downlineCount: 0, income: '0'},
                {name: 'Level 7', percent: 0.2, icon: group, downlineCount: 0, income: '0'},
                {name: 'Level 8', percent: 0.1, icon: group, downlineCount: 0, income: '0'},
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

                this.referralLink = `${window.location.protocol}//${window.location.host}/?ref=${user_data.referralCode}`
                this.available_commissions = formatEther(user_data.totalBonus)
                this.referralCode = user_data.referralCode
                this.total_withdraw = formatEther(user_data.totalWithdraw)
                this.total_deposit = formatEther(user_data.totalDeposit)

                const referralStats = await getUserReferralLevelStats(account)
                this.levels = this.levels.map((level, index) => ({
                    ...level,
                    downlineCount: referralStats.levelCounts[index] || 0,
                    income: referralStats.levelIncome[index] || '0',
                }))

                this.your_reward = await getTotalProfit(th.account)

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
        async withdrawCommission() {
            if (!this.connected) await ConnectWalletClient();
            if (this.available_commissions === '0') {
                this.toast.error("No commission to withdraw");
                return;
            }
            await withdrawCommissionsRequest(this.account)
            await this.fetchData()
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
        async withdrawReward() {
            await withdrawDividends(this.account);
        },
        copyToClipboard() {
            this.$copyText(this.referralLink).then(() => {
                this.$toast.success('Referral link copied to clipboard!');
            }, () => {
                this.$toast.error('Failed to copy referral link.');
            });
        },

    },
    setup() {
        const truncateZeroes = (value) => {
            if (!value || value.toString() === '0') return 0
            const regex = /\.?0+$/;
            return value.replace(regex, '');
        };

        const toast = useToast();

        return {
            toast,
            truncateZeroes,
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
