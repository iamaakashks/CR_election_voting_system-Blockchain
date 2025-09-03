require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545", // The RPC Server address from Ganache
      accounts: ['0x7c090d7088b56641eb54b3bac21d6ca5c39bd33a902cea1a7195723c6512b306'] // The private key from the first account in Ganache
    }
  }
};