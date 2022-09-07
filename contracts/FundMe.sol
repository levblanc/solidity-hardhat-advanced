// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import './PriceConverter.sol';

error NotOwner();

contract FundMe {
    using PriceConverter for uint256;

    uint256 public constant MINIMUM_USD = 50 * 10**18;
    address[] public funders;
    mapping(address => uint256) public addressToAmountFunded;

    address public immutable i_owner;

    constructor() {
        i_owner = msg.sender;
    }

    function fund() public payable {
        // Want to be able to set a minimum fund amount in USD
        // 1. How to we send ETH to this contract?
        require(
            msg.value.getConversionRate() >= MINIMUM_USD,
            "Didn't send enough!"
        );

        // What is reverting?
        // Undo any actions before, and send remaining gas back

        // keep track of funders of the contract
        addressToAmountFunded[msg.sender] = msg.value;
        funders.push(msg.sender);
    }

    function withdraw() public onlyi_owner {
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            addressToAmountFunded[funder] = 0;
        }

        // reset the array
        funders = new address[](0);

        // actually withdraw the funds
        // // transfer
        // payable(msg.sender).transfer(address(this).balance);
        // // send
        // bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // call
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }('');
        require(callSuccess, 'Call failed');
    }

    modifier onlyi_owner() {
        if (msg.sender != i_owner) {
            revert NotOwner();
        }
        _;
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
}
