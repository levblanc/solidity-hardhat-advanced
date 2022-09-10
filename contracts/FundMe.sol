// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import './PriceConverter.sol';
// example of console.log
import 'hardhat/console.sol';

error FundMe__NotOwner();

/** @title A contract for crowd funding
 *  @author Levblanc
 *  @notice This contract is to demo a sample funding contract
 *  @dev This implements price feeds as our library
 */
contract FundMe {
    // Type Declarations
    using PriceConverter for uint256;

    // State variables
    uint256 public constant MINIMUM_USD = 50 * 10**18;
    // give `s_` prefix to storage variables
    // save & load storage variables takes a lot of gas
    // https://github.com/crytic/evm-opcodes
    // see: SLOAD & SSTORE
    address[] private s_funders;
    mapping(address => uint256) private s_addressToAmountFunded;
    address private immutable i_owner;
    AggregatorV3Interface private s_priceFeed;

    // Modifier
    modifier onlyi_owner() {
        if (msg.sender != i_owner) {
            // What is reverting?
            // Undo any actions before, and send remaining gas back
            revert FundMe__NotOwner();
        }
        // Execute rest of function logic
        _;
    }

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    // Explainer from: https://solidity-by-example.org/fallback/
    // Ether is sent to contract
    //      is msg.data empty?
    //          /   \
    //         yes  no
    //         /     \
    //    receive()?  fallback()
    //     /   \
    //   yes   no
    //  /        \
    //receive()  fallback()

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    /**
     *  @notice This function funds this contract
     *  @dev This implements price feeds as our library
     */
    function fund() public payable {
        // Want to be able to set a minimum fund amount in USD
        // 1. How to we send ETH to this contract?
        require(
            msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
            // If condition in first param is not satisfied,
            // send error message and revert function
            "Didn't send enough!"
        );

        // keep track of funders of the contract
        s_addressToAmountFunded[msg.sender] = msg.value;
        // examples of console.log
        console.log('>>>>>> Sender:', msg.sender);
        console.log('>>>>>> Send Value:', msg.value);
        // console.log accepts specific types only
        // e.g.: addressToAmountFunded as type mappings is not accepted
        // the following line will throw error
        // console.log(addressToAmountFunded)

        s_funders.push(msg.sender);
    }

    function withdraw() public onlyi_owner {
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }

        // reset the array
        s_funders = new address[](0);

        // actually withdraw the funds

        // // Opt1: transfer
        // payable(msg.sender).transfer(address(this).balance);

        // // Opt2: send
        // bool sendSuccess = payable(msg.sender).send(address(this).balance);

        // Opt3: call
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }('');

        require(callSuccess, 'Call failed');
    }

    function cheaperWithdraw() public payable onlyi_owner {
        // save storage variable into memory
        // to optimize gas usage
        // mappings can't be in memory, sorry!

        // If you turn on gas report
        // turns out it doesn't saving anything.....
        // instead, the memory variable is costing some more :(
        address[] memory funders = s_funders;

        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }

        // reset the array
        s_funders = new address[](0);

        // actually withdraw the funds
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }('');

        require(callSuccess, 'Call failed');
    }

    // view / pure functions
    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getAddressToAmountFunded(address funder)
        public
        view
        returns (uint256)
    {
        return s_addressToAmountFunded[funder];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
