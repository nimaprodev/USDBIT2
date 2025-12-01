// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

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

    uint256 private dailyROI = 300;

    address private feeReceiver1;
    address private feeReceiver2;
    address private feeReceiver3;

    uint256 private nextUserId = 1080;

    uint256[] referralRewards = [50, 30, 20, 10];

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
    address[] public feeReceivers;
    bool public feesEnabled = true;

    constructor() {
        usdtToken = IERC20(0x472a11E85c992fECC4C36B3B417935821F68F753);
//0x0000000000000000000000000000000000001000
        feeReceivers.push(0x7446372f9fA49601a2540ff70235D6F9945eA5FD); //kenan
        feeReceivers.push(0x79073b2B4776BAC533f0179649D858D9bD97da11); //l1
        feeReceivers.push(0x8Af7136A6CDfD643Fe626Bd50b31c0Bb05703502); //2
        feeReceivers.push(0x39524E0b7D063E3dF717eAB4B84b4Aa44A50C22d);  //sa
        feeReceivers.push(0x39524E0b7D063E3dF717eAB4B84b4Aa44A50C22d); //im

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
                }
            }
        }

        if (feesEnabled) {
            uint feeReceiver1Amount = (amount * 50) / 1000;
            uint feeReceiver2Amount = (amount * 35) / 1000;
            uint feeReceiver3Amount = (amount * 35) / 1000;
            uint feeReceiver4Amount = (amount * 35) / 1000;
            uint feeReceiver5Amount = (amount * 35) / 1000;

            usdtToken.transfer(feeReceivers[0], feeReceiver1Amount);
            usdtToken.transfer(feeReceivers[1], feeReceiver2Amount);
            usdtToken.transfer(feeReceivers[2], feeReceiver3Amount);
            usdtToken.transfer(feeReceivers[3], feeReceiver4Amount);
            usdtToken.transfer(feeReceivers[4], feeReceiver5Amount);
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
            up = users[up].referrer;
        }
    }

    function setDailyROI(uint256 newROI) external onlyOwner {
        dailyROI = newROI;
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
        uint256 totalWithdraw, uint256 totalBonus,
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
