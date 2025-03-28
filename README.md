# Hardhat Project Example



##  Overview
This project showcases a basic use case of Hardhat, a powerful development environment for Ethereum smart contracts. It includes:

+ A sample smart contract
+ A test suite for the contract
+ A Hardhat Ignition module for deployment

##  Getting Started
Try running the following commands in your terminal:

Display help information: 
`npx hardhat help`

Run contract tests: `npx hardhat test`

Generate gas reports during testing: `REPORT_GAS=true npx hardhat test`

Start a local Ethereum node: `npx hardhat node`

Deploy the contract using Hardhat Ignition:
`npx hardhat ignition deploy ./ignition/modules/Lock.js`
