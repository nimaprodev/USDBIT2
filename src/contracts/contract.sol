// SPDX-License-Identifier: MIT
pragma solidity 0.8.25;

interface IERC20 {
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract USDBIT {
    uint256 constant PERCENTS_DIVIDER = 10000;
    uint256 constant SECONDS_IN_DAY = 1 days;
    uint256 constant CONTRACT_DURATION = 120 days;
    uint256 constant MIN_INVEST = 20 ether;
    uint256 constant REFERRAL_LEVELS = 8;

    uint256 private dailyROI = 250;

    uint256 private nextUserId = 1999;

    uint256[] referralRewards = [50, 30, 20, 10, 5, 2, 2, 1];

    address internal _owner;
    IERC20 public usdtToken;

    event NewDeposit(address indexed user, uint amount, uint timestamp);
    event ProfitWithdrawal(address indexed user, uint amount, uint timestamp);

    struct Deposit {
        uint256 amount;
        uint256 startTime;
        uint256 withdrawnDividends;
        uint256 lastWithdrawTime;
        uint256 dailyROI;
    }

    struct User {
        uint256 totalDeposit;
        uint256 totalWithdraw;
        uint256 id;
        uint256 referralCode;
        uint256 referrerCode;
        address referrer;
        uint256 totalBonus;
        uint256 totalReferralRewards;
        Deposit[] deposits;
    }

    mapping(address => User) public users;
    mapping(uint256 => address) public referralCodeToAddress;
    mapping(address => uint256[REFERRAL_LEVELS]) private userLevelDownlineCounts;
    mapping(address => uint256[REFERRAL_LEVELS]) private userLevelIncome;
    address[] public feeReceivers;
    bool public feesEnabled = true;

    constructor() {
        require(referralRewards.length == REFERRAL_LEVELS, "Invalid referral config");
        usdtToken = IERC20(0x55d398326f99059fF775485246999027B3197955);

        feeReceivers.push(0x34Fe0BEea14426a6EB0996f0A6129eD433f5D9b4);
        feeReceivers.push(0x5CaB02E5fbf56e868CEC159167fd9086532A0DE7);
        feeReceivers.push(0xb5C4cFD28C4181Bc7F841671C5F7Df29f8d03b7F);
        feeReceivers.push(0xaAb0122c6aA395957e2aB22C3f88687190944560);

        _owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == _owner, "Only owner");
        _;
    }

    function deposit(uint256 amount, uint256 refCode) external {
        require(amount >= MIN_INVEST, "Min 20 USDT");
        usdtToken.transferFrom(msg.sender, address(this), amount);

        if (users[msg.sender].id == 0) {
            users[msg.sender].id = nextUserId;
            users[msg.sender].referralCode = nextUserId;
            referralCodeToAddress[nextUserId] = msg.sender;
            nextUserId++;
            if (
                users[msg.sender].referrer == address(0) &&
                refCode != 0 &&
                referralCodeToAddress[refCode] != msg.sender &&
                refCode != users[msg.sender].referralCode
            ) {
                address refAddr = referralCodeToAddress[refCode];
                if (refAddr != address(0)) {
                    users[msg.sender].referrer = refAddr;
                    users[msg.sender].referrerCode = refCode;
                    _registerDownlineCounts(refAddr);
                }
            }
        }

        if (feesEnabled) {
            uint feeReceiver1Amount = (amount * 600) / 10000;
            uint feeReceiver2Amount = (amount * 600) / 10000;
            uint feeReceiver3Amount = (amount * 375) / 10000;
            uint feeReceiver4Amount = (amount * 375) / 10000;

            usdtToken.transfer(feeReceivers[0], feeReceiver1Amount);
            usdtToken.transfer(feeReceivers[1], feeReceiver2Amount);
            usdtToken.transfer(feeReceivers[2], feeReceiver3Amount);
            usdtToken.transfer(feeReceivers[3], feeReceiver4Amount);
        }


        uint256 investAmount = amount;

        users[msg.sender].deposits.push(
            Deposit({
                amount: investAmount,
                startTime: block.timestamp,
                withdrawnDividends: 0,
                lastWithdrawTime: block.timestamp,
                dailyROI: dailyROI
            })
        );
        users[msg.sender].totalDeposit += investAmount;

        _distributeReferralRewards(investAmount, msg.sender);

        emit NewDeposit(msg.sender, investAmount, block.timestamp);
    }

    function _distributeReferralRewards(uint256 amount, address userAddr) internal {
        address up = users[userAddr].referrer;
        for (uint256 i = 0; i < referralRewards.length; i++) {
            if (up == address(0)) break;
            uint256 reward = (amount * referralRewards[i]) / 1000;
            users[up].totalReferralRewards += reward;
            users[up].totalBonus += reward;
            userLevelIncome[up][i] += reward;
            up = users[up].referrer;
        }
    }

    function _registerDownlineCounts(address referrerAddr) internal {
        address up = referrerAddr;
        for (uint256 i = 0; i < REFERRAL_LEVELS; i++) {
            if (up == address(0)) break;
            userLevelDownlineCounts[up][i] += 1;
            up = users[up].referrer;
        }
    }function setDailyROI(uint256 newROI) external onlyOwner {dailyROI = newROI;}


    function getUserReferralLevelStats(address userAddr) external view returns (
        uint256[REFERRAL_LEVELS] memory levelCounts,
        uint256[REFERRAL_LEVELS] memory levelIncomeTotals
    ) {
        return (userLevelDownlineCounts[userAddr], userLevelIncome[userAddr]);
    }

    function getUserReferralLevelStat(address userAddr, uint256 level) external view returns (
        uint256 downlineCount,
        uint256 income
    ) {
        require(level < REFERRAL_LEVELS, "Invalid level");
        return (userLevelDownlineCounts[userAddr][level], userLevelIncome[userAddr][level]);
    }

    function claimReferralRewards() external {
        User storage user = users[msg.sender];
        require(user.totalBonus > 0, "Nothing to claim");

        uint256 amount = user.totalBonus;
        user.totalBonus = 0;
        usdtToken.transfer(msg.sender, amount);
    }

    function getUserInfo(address userAddr) external view returns (
        uint256 id,
        uint256 referralCode,
        uint256 referrerCode,
        address referrer,
        uint256 totalDeposit,
        uint256 totalWithdraw,
        uint256 totalBonus,
        uint256 totalReferralRewards
    ) {
        User storage user = users[userAddr];
        return (
            user.id,
            user.referralCode,
            user.referrerCode,
            user.referrer,
            user.totalDeposit,
            user.totalWithdraw,
            user.totalBonus,
            user.totalReferralRewards
        );
        }
    function setFeesEnabled(bool _enabled) external onlyOwner {
        feesEnabled = _enabled;
    }

    function getUserDividends(address userAddr) external view returns (uint256 totalProfit) {
        User storage user = users[userAddr];

        for (uint256 i = 0; i < user.deposits.length; i++) {
            Deposit storage dep = user.deposits[i];

            uint256 endTime = dep.startTime + CONTRACT_DURATION;
            uint256 toTime = block.timestamp > endTime ? endTime : block.timestamp;
            uint256 timePassed = toTime > dep.lastWithdrawTime ? toTime - dep.lastWithdrawTime : 0;

            if (timePassed == 0) continue;

            uint256 profit = (dep.amount * dep.dailyROI * timePassed) / (PERCENTS_DIVIDER * SECONDS_IN_DAY);
            totalProfit += profit;
        }
    }

    function setFeeReceivers(address[] calldata newReceivers) external onlyOwner {
        require(newReceivers.length > 0, "Receivers list cannot be empty");

        delete feeReceivers;

        for (uint i = 0; i < newReceivers.length; i++) {
            require(newReceivers[i] != address(0), "Invalid receiver");
            feeReceivers.push(newReceivers[i]);
        }
    }

    function withdrawProfit() external {
        User storage user = users[msg.sender];
        uint256 totalProfit = 0;

        for (uint256 i = 0; i < user.deposits.length; i++) {
            Deposit storage dep = user.deposits[i];

            uint256 endTime = dep.startTime + CONTRACT_DURATION;
            uint256 toTime = block.timestamp > endTime ? endTime : block.timestamp;
            uint256 timePassed = toTime > dep.lastWithdrawTime ? toTime - dep.lastWithdrawTime : 0;

            if (timePassed == 0) continue;

            uint256 profit = (dep.amount * dep.dailyROI * timePassed) / (PERCENTS_DIVIDER * SECONDS_IN_DAY);
            dep.withdrawnDividends += profit;
            dep.lastWithdrawTime = block.timestamp;
            totalProfit += profit;
        }

        require(totalProfit > 0, "No profit");
        user.totalWithdraw += totalProfit;
        usdtToken.transfer(msg.sender, totalProfit);

        emit ProfitWithdrawal(msg.sender, totalProfit, block.timestamp);
    }

    receive() external payable {}
}
