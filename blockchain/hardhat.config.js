require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545", // The RPC Server address from Ganache
      accounts: ['4bff73e77c8d8531d3bee27cf420a8f87b9dfde301a12fe5bab2b4fad3f92d3a'] // The private key from the first account in Ganache
    }
  }
};