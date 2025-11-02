require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545", // The RPC Server address from Ganache
      accounts: ['577bb83896e1fc9f3648b101c18ed155dc8a22ca0734a20462583b70574ff50c'] // The private key from the first account in Ganache
    }
  }
};