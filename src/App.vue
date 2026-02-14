<template>
  <div class="w-full min-h-screen flex justify-center items-start">
    <div class="w-[380px] min-h-[700px] overflow-hidden">
      <div class="relative bg-bgCard shadow-custom-glow  text-center overflow-hidden">

        <header class="absolute top-0 left-0 w-full flex items-center justify-between px-5 py-4 z-10">
          <img :src="logo" alt="Hero Image" class="object-cover "/>
          <div v-if="isConnected" class="flex items-center space-x-2">
            <span class="text-black text-sm  bg-yellow-500  px-3 py-1 rounded-md">{{ shortAddress() }}</span>
          </div>
            <button v-else
                @click="connectWallet"
                class="bg-primary text-white px-4 py-2 rounded-md"
            >
              Connect Wallet
            </button>
        </header>
        <div class="mt-16">
          <img :src="heroImg" alt="Hero Image" class="object-cover w-full h-auto"/>
          <div class="absolute inset-0 flex flex-col justify-end items-center text-center px-4 pb-6">
            <p class="text-2xl text-white font-bold w-3/4">
              Grow your future with USDBIT and enjoy bonuses every single day
            </p>
            <p class="mt-3 text-xs text-white w-full">
              2.5% daily bonus and 8 levels Referral marketing!
            </p>

          </div>
        </div>
      </div>

      <!--      <DepositCard >-->
      <div class="bg-gray-100 p-6 rounded-md w-full ">

        <div class="flex justify-between gap-2 ">
          <div class="flex-1 bg-gray-50 p-4 rounded-md flex flex-col ">
            <p class="text-primary text-sm">Total Deposit</p>
            <p class="text-white text-xl font-bold mt-1">{{ formatDisplayNumber(total_deposit) }} USDT</p>
          </div>

          <div class="flex-1 bg-gray-50 p-4 rounded-md flex flex-col ">
            <p class="text-primary text-sm">Total Withdraw</p>
            <p class="text-white text-xl font-bold mt-1">{{ formatDisplayNumber(total_withdraw) }} USDT</p>
          </div>
        </div>

        <div class="flex flex-col mt-2">
          <div class="flex flex-col mt-2">
            <label class="text-gray-300 text-sm mb-2" for="amount">Amount (min 20 USDT)</label>

            <div class="relative">
              <input id="amount" type="number" v-model="amount" placeholder="Enter amount" class="w-full p-3 pr-16 rounded-lg bg-gray-700 text-white
             focus:outline-none focus:ring-2 focus:ring-primary"/>

              <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 text-sm font-semibold select-none">
                        USDT
                    </span>
            </div>
          </div>

          <div class="flex items-center gap-2 mt-3">
            <div v-for="item in quickValues" :key="item" @click="selectValue(item)" :class="[
                    'px-2.5 py-1 rounded-md  text-xs font-medium cursor-pointer border transition whitespace-nowrap',
                    selected === item
                        ? 'bg-gray-600 text-white border-primary'
                        : 'text-gray-500 border-gray-500 hover:border-primary'
                ]">
              {{ item }}
            </div>
          </div>
        </div>
        <div class="flex items-center justify-end mt-5 mb-2">
          <img :src="trendUp" alt="trendUp Image" class="object-contain"/>
          <p class="text-xs text-gray-400">Your Balance {{ formatDisplayNumber(balance) }} USDT</p>
        </div>
        <button class="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:opacity-90 transition"
                v-loading="isLoading"
                @click="doDeposit">
          Deposit Now
        </button>
      </div>
      <!--      <DepositCard />-->

      <!--      RewardCard -->
      <div class="relative text-center overflow-hidden">
        <img :src="rewardImg" alt="Reward Image" class="object-cover w-full h-auto"/>

        <div class="absolute inset-0 flex flex-col justify-end items-center text-center px-4 pb-6">

          <div class="bg-gray-100 p-6 rounded-md w-full">

            <div class="flex items-start gap-4 p-2 rounded-md">

              <div class="w-14 h-14 rounded-md bg-primary flex items-center justify-center  mt-1">
                <img :src="walletMoney" alt="walletMoney" class="object-contain"/>
              </div>

              <div class="flex flex-col text-left">
                <p class="text-primary font-semibold text-sm">Your Reward</p>

                <span class="text-xl font-semibold text-white leading-none mt-3">
                            {{ formatDisplayNumber(your_reward, 6) }} USDT
                        </span>
                <button v-loading="isWithdrawRewardLoading" @click="withdrawReward"
                        class="text-white text-sm mt-5 inline-flex items-center justify-center bg-secondary p-2 px-5 rounded">
                            <span class="inline-flex items-center">
                                Withdraw Now
                                <img :src="arrowRight" alt="arrow right" class="ml-4 align-middle"/>
                            </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!--      <RewardCard/>-->

      <div class="text-white p-6 my-6">
        <p class="text-base font-semibold">Welcome to USDBIT</p>
        <p class="text-2xl font-extrabold">
          Your Smart Financial
        </p>
        <p class="text-2xl font-extrabold text-primary">
          Experience
        </p>
        <p class="text-justify mt-4 text-base leading-loose text-gray-400">
          Welcome to USDBIT – your trusted gateway to stable USDT-based growth!<br/>
          At USDBIT, you earn a solid 2.5% daily ROI for 120 days — starting with only 20 USDT.<br/>
          Our automated smart-contract system locks your capital securely and rewards you with transparent daily
          profits.<br/>
          Plus, with our 8-level referral program, you can boost your earnings: 5% from Level 1, 3% from Level 2, 2% from Level 3, 1% from Level 4, 0.5% from Level 5, 0.2% from Level 6, 0.2% from Level 7, and 0.1% from Level 8  paid instantly in
          USDT.<br/>
          Join USDBIT today and experience smart, reliable, and reward-driven investing — powered fully by
          blockchain.<br/>

        </p>
      </div>
      <!--      ReferralCard -->
      <div class="bg-gray-100 p-6 w-full">
        <img :src="referralImg" alt="referral Image" class="object-cover mb-4"/>

        <div class="flex items-center text-2xl font-extrabold gap-2 mb-4">
          <span class="text-white">Your</span>
          <span class="text-primary">referral link</span>
        </div>

        <p class="text-justify text-base leading-loose text-gray-400 mb-6">
          Share your unique link and earn rewards every time someone joins through you. Invite friends, build your
          network,
          and grow together—success is better when shared.
        </p>

        <div class="relative w-full mb-10">
          <input readonly :value="referralLink"
                 class="w-full pl-4 py-3 rounded-xl bg-gray-50 text-white focus:outline-none focus:ring-2 focus:ring-primary"/>
          <button
              class="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-primary flex items-center justify-center"
              @click="copyToClipboard">
            <img :src="clipboard" alt="clipboard" class="w-5 h-5"/>
          </button>
        </div>
      </div>
      <!--      end Referral Card    -->
      <!--      <TotalCommissionCard>-->
      <div class="w-full text-center">
        <div class="relative w-full pb-20">
          <img :src="totalCommissionImg" alt="Total Commissions" class="object-cover w-full h-auto"/>
          <div class="absolute inset-x-0 bottom-0 px-4 ">
            <div class="bg-gray-100 p-6 rounded-md w-full  mx-auto ">
              <div class="flex items-center gap-4">
                <div class="w-14 h-14 rounded-md bg-primary flex items-center justify-center">
                  <img :src="group" alt="Group Icon" class="object-contain"/>
                </div>
                <div class="flex flex-col text-left flex-1">
                  <p class="text-primary font-semibold text-sm">Total Commissions</p>
                  <span class="text-xl font-semibold text-white mt-2 leading-none">{{ formatDisplayNumber(available_commissions) }} USDT</span>
                  <button v-loading="isClaimingReferralReward" @click="withdrawCommission"
                          class="text-white bg-secondary text-sm mt-2 w-36 inline-flex items-center rounded px-3 py-1">

                    Withdraw Now
                    <img :src="arrowRight" alt="Arrow Right" class="ml-2 align-middle"/>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-2 w-full max-w-md mx-auto mt-4 px-4">
          <div v-for="level in levels" :key="level.name"
               class="bg-gray-800 p-4 rounded-md w-full flex items-center gap-4">
            <div class="w-10 h-10 rounded-md bg-primary flex items-center justify-center">
              <img :src="level.icon" alt="Level Icon" class="w-6 h-6 object-contain"/>
            </div>
            <div class="flex flex-col text-left">
              <p class="text-primary font-bold text-sm">{{ level.name }}</p>
              <span class="text-xl font-semibold text-white ">{{ level.percent }}%</span>
              <p class="text-xs text-gray-400 mt-1">Members: {{ level.downlineCount }}</p>
              <p class="text-xs text-gray-400">Income: {{ formatDisplayNumber(level.income, 4) }} USDT</p>
            </div>
          </div>
        </div>
      </div>
      <!--      </TotalCommissionCard>-->


            <div class=" p-6 w-full mb-6">
        <div class="flex items-center text-2xl font-extrabold gap-2 mb-4">
          <span class="text-primary">FAQ</span>
        </div>

        <div class="flex flex-col gap-3">
          <details
              v-for="(item, index) in faqItems"
              :key="item.question"
              class="bg-gray-50 rounded-md p-4 group"
          >
            <summary class="list-none cursor-pointer text-left flex items-start justify-between gap-3">
              <span class="text-white font-semibold text-sm">{{ index + 1 }}. {{ item.question }}</span>
              <span class="text-primary text-base leading-none group-open:rotate-45 transition-transform">+</span>
            </summary>
            <p class="text-gray-400 text-sm leading-relaxed mt-3 text-left">
              {{ item.answer }}
            </p>
          </details>
        </div>
      </div>
      <div class="text-center  p-6">
        <div class="flex flex-col items-center text-center">
          <img :src="footerLogo" alt="footer logo" />
          <p class="text-justify mt-5 text-base text-gray-500">
            USDBIT runs on a transparent USDT smart contract that rewards you with fixed daily profits for 120 days.
            Your capital stays securely locked while earnings are paid automatically.
            Our 8-level referral system delivers instant USDT bonuses.
            USDBIT — smart, stable, and blockchain-driven income.<br><br><br>
            <small>71–75 Shelton Street, Covent Garden, London WC2H 9JQ, United Kingdom</small>
          </p>
          <a href="//t.me/usdbit_team" class="text-gray-200 px-4 py-2 rounded-lg border border-grey-300 mt-4 mb-10 flex items-center gap-2">
            <img :src="telegram" alt="telegram" />
            Telegram Channel
          </a>

        </div>
      </div>
    </div>
  </div>
</template>
<script>
import app from './App.js'

export default app
</script>
