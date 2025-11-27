<template>
    <div class="bg-gray-100 p-6 rounded-md max-w-[380px] mx-auto  shadow-lg">

        <div class="flex justify-between gap-2 ">
            <div class="flex-1 bg-gray-50 p-4 rounded-md flex flex-col ">
                <p class="text-primary text-sm">Total Deposit</p>
                <p class="text-white text-xl font-bold mt-1">3.52 Bit</p>
            </div>

            <div class="flex-1 bg-gray-50 p-4 rounded-md flex flex-col ">
                <p class="text-primary text-sm">Total Withdraw</p>
                <p class="text-white text-xl font-bold mt-1">1.25 Bit</p>
            </div>
        </div>

        <div class="flex flex-col mt-2">
            <label class="text-gray-300 text-sm mb-2" for="amount">Amount</label>
            <input id="amount" type="number" placeholder="Enter amount"
                class="p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <p class="text-xs">Your Balance 0 BIT </p>
        <button class="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:opacity-90 transition">
            Deposit Now
        </button>
    </div>
</template>
  
<script setup lang="ts">
</script>
  