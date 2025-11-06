require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545", // The RPC Server address from Ganache
      accounts: ['7fe268142275ab34144e642a56d7732460319c02e5260ed5a952a59abec043e2'] // The private key from the first account in Ganache
    }
  }
};