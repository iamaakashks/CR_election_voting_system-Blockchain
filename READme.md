# Blockchain
-> open ganache and quickstart
-> copy the private key of the index 0 block (donot copy 0x, copy just after 0x)
-> go to the server/.env file and paste the private key in SERVER_WALLET_PRIVATE_KEY
-> go to the blockchain/hardhat.config.js file and paste this private key in the accounts field.
-> go into blockchain folder and run the command npx hardhat run scripts/deploy.js --network ganache
-> will display one master verivote contract address copy the full address (with 0x) and paste to the server/.env file's CONTRACT_ADDRESS

# Server
-> load the data npm run data:import
-> npm run start

# Client
-> npm run dev