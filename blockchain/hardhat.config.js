require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545", // The RPC Server address from Ganache
      accounts: ['020d37762e0ee196cc35bdb381309211724fe17932a7295305ee7a01c2beb2be'] // The private key from the first account in Ganache
    }
  }
};