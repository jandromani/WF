// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {PayWFANS} from "../../contracts/PayWFANS.sol";
import {WorldFansData} from "../../contracts/WorldFansData.sol";
import {WorldFansTreasury} from "../../contracts/WorldFansTreasury.sol";
import {IERC20} from "../../contracts/vendor/oz/token/ERC20/IERC20.sol";
import {IERC20Burnable} from "../../contracts/vendor/oz/token/ERC20/extensions/IERC20Burnable.sol";

contract MockWFANSToken {
    string public constant name = "WFANS";
    string public constant symbol = "WFANS";
    uint8 public constant decimals = 18;

    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
        totalSupply += amount;
        emit Transfer(address(0), to, amount);
    }

    function burn(uint256 amount) external {
        require(balanceOf[msg.sender] >= amount, "burn amount exceeds balance");
        balanceOf[msg.sender] -= amount;
        totalSupply -= amount;
        emit Transfer(msg.sender, address(0), amount);
    }

    function burnFrom(address account, uint256 amount) external {
        uint256 currentAllowance = allowance[account][msg.sender];
        require(currentAllowance >= amount, "burn allowance");
        allowance[account][msg.sender] = currentAllowance - amount;
        require(balanceOf[account] >= amount, "burn balance");
        balanceOf[account] -= amount;
        totalSupply -= amount;
        emit Transfer(account, address(0), amount);
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 allowed = allowance[from][msg.sender];
        require(allowed >= amount, "transfer allowance");
        allowance[from][msg.sender] = allowed - amount;
        _transfer(from, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function _transfer(address from, address to, uint256 amount) internal {
        require(to != address(0), "transfer to zero");
        require(balanceOf[from] >= amount, "transfer balance");
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
    }
}

contract UserActor {
    MockWFANSToken public immutable token;
    PayWFANS public immutable pay;

    constructor(MockWFANSToken token_, PayWFANS pay_) {
        token = token_;
        pay = pay_;
    }

    function approveAll() external {
        token.approve(address(pay), type(uint256).max);
    }

    function tip(address creator, uint256 amount) external {
        pay.tip(creator, amount);
    }

    function subscribe(address creator, uint64 cycles) external {
        pay.subscribe(creator, cycles);
    }
}

contract ReentrantTreasury is WorldFansTreasury {
    PayWFANS public payContract;
    address public reentryCreator;
    uint256 public reentryAmount;

    constructor(address admin, MockWFANSToken token_, uint256 emission, uint256 target)
        WorldFansTreasury(admin, IERC20(address(token_)), IERC20Burnable(address(token_)), emission, target)
    {}

    function configure(PayWFANS pay_, address creator_, uint256 amount_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        payContract = pay_;
        reentryCreator = creator_;
        reentryAmount = amount_;
    }

    function approveToken(address spender, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        token.approve(spender, amount);
    }

    function handlePayment(uint256 feeAmount, uint256 burnAmount) public override onlyRole(PAY_MODULE_ROLE) {
        super.handlePayment(feeAmount, burnAmount);
        if (address(payContract) != address(0) && reentryAmount > 0) {
            payContract.tip(reentryCreator, reentryAmount);
        }
    }
}

contract PayWFANSTest {
    MockWFANSToken internal token;
    WorldFansData internal dataContract;
    WorldFansTreasury internal treasury;
    PayWFANS internal pay;
    UserActor internal fan;

    address internal admin;
    address internal creator;
    address internal treasuryWallet;
    address internal creatorsVault;
    address internal communityPool;
    address internal growthReserve;

    uint256 internal constant INITIAL_BALANCE = 1_000 ether;
    uint256 internal constant TIP_AMOUNT = 100 ether;

    constructor() {
        admin = address(this);
        creator = address(0xCAFE);
        treasuryWallet = address(0xBEEF);
        creatorsVault = address(0xC0FFEE);
        communityPool = address(0xDADA);
        growthReserve = address(0xFACE);

        token = new MockWFANSToken();
        dataContract = new WorldFansData(admin);
        treasury = new WorldFansTreasury(admin, IERC20(address(token)), IERC20Burnable(address(token)), 1_000 ether, 1_000_000 ether);
        pay = new PayWFANS(admin, IERC20(address(token)), dataContract, treasury, 500, 1 ether);
        fan = new UserActor(token, pay);

        dataContract.grantSubscriptionUpdater(address(pay));
        dataContract.upsertCreator(creator, 50 ether, true);

        treasury.setVaults(treasuryWallet, creatorsVault, communityPool, growthReserve);
        treasury.grantPayModule(address(pay));
        treasury.grantSupplyManager(admin);
        treasury.grantEpochManager(admin);

        token.mint(address(fan), INITIAL_BALANCE);
        token.mint(address(treasury), INITIAL_BALANCE);
        fan.approveAll();
    }

    function assertEq(uint256 a, uint256 b, string memory message) internal pure {
        require(a == b, message);
    }

    function assertGt(uint256 a, uint256 b, string memory message) internal pure {
        require(a > b, message);
    }

    function testTipDistributesAndBurns() public {
        uint256 preCreator = token.balanceOf(creator);
        uint256 preTreasury = token.balanceOf(address(treasury));
        uint256 preSupply = token.totalSupply();

        fan.tip(creator, TIP_AMOUNT);

        uint16 burnBps = treasury.currentBurnBps();
        uint256 expectedFee = (TIP_AMOUNT * pay.feeBps()) / 10_000;
        uint256 expectedBurn = (TIP_AMOUNT * burnBps) / 10_000;
        uint256 expectedNet = TIP_AMOUNT - expectedFee - expectedBurn;

        assertEq(token.balanceOf(creator), preCreator + expectedNet, "creator payout incorrect");
        assertEq(token.balanceOf(address(treasury)), preTreasury + expectedFee, "treasury fee incorrect");
        assertEq(token.totalSupply(), preSupply - expectedBurn, "supply burn incorrect");
    }

    function testSubscribeExtendsExpiry() public {
        uint64 cycles = 2;
        uint256 amount = dataContract.creatorPrice(creator) * cycles;
        fan.subscribe(creator, cycles);

        WorldFansData.Subscription memory sub = dataContract.getSubscription(address(fan), creator);
        uint64 expectedExpiry = uint64(block.timestamp + dataContract.subscriptionPeriod() * cycles);
        assertGt(sub.expiresAt, uint64(block.timestamp), "subscription expiry not set");
        require(sub.expiresAt <= expectedExpiry + 1, "expiry beyond tolerance");

        uint16 burnBps = treasury.currentBurnBps();
        uint256 expectedFee = (amount * pay.feeBps()) / 10_000;
        uint256 expectedBurn = (amount * burnBps) / 10_000;
        uint256 expectedNet = amount - expectedFee - expectedBurn;

        assertEq(token.balanceOf(creator), expectedNet, "creator subscription payout incorrect");
    }

    function testOnlyAdminCanUpdateFee() public {
        pay.setFeeBps(700);
        assertEq(uint256(pay.feeBps()), 700, "admin fee update failed");

        UnauthorizedActor attacker = new UnauthorizedActor();
        try attacker.setFee(pay, 600) {
            revert("non admin should fail");
        } catch {}
    }

    function testReentrancyIsPrevented() public {
        ReentrantTreasury malicious = new ReentrantTreasury(admin, token, 1_000 ether, 1_000_000 ether);
        PayWFANS reentrantPay = new PayWFANS(admin, IERC20(address(token)), dataContract, malicious, 500, 1 ether);

        dataContract.grantSubscriptionUpdater(address(reentrantPay));
        malicious.setVaults(treasuryWallet, creatorsVault, communityPool, growthReserve);
        malicious.grantPayModule(address(reentrantPay));

        malicious.configure(reentrantPay, creator, 10 ether);
        token.mint(address(malicious), TIP_AMOUNT);
        malicious.approveToken(address(reentrantPay), TIP_AMOUNT);

        UserActor reentrantFan = new UserActor(token, reentrantPay);
        token.mint(address(reentrantFan), TIP_AMOUNT);
        reentrantFan.approveAll();

        try reentrantFan.tip(creator, 20 ether) {
            revert("reentrancy should fail");
        } catch {}
    }

    function testAmountValidation() public {
        try fan.tip(creator, 0) {
            revert("zero tip should fail");
        } catch {}

        try fan.subscribe(creator, 0) {
            revert("zero cycles should fail");
        } catch {}
    }
}

contract UnauthorizedActor {
    function setFee(PayWFANS pay, uint16 newFee) external {
        pay.setFeeBps(newFee);
    }
}

