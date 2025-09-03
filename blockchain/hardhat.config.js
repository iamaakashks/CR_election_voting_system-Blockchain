require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545", // The RPC Server address from Ganache
      accounts: ['0x48e2a17ff9e9c3225ac6958c9c11281bd809d12fea89962ce5ead34bfa626bc2'] // The private key from the first account in Ganache
    }
  }
};