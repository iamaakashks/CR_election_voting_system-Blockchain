Part 1: How to Run the Project on Your Computer

  Follow these steps exactly to get the project running. You will need four
  terminal windows.

  Prerequisites: Make sure you have Node.js, npm, and MongoDB installed on
  your computer.

  Step 1: Open Four Terminals
      - Open four separate terminal windows. This will help you manage the
        three parts of the project (blockchain, server, client) and the
        contract deployment.

  Step 2: Install Everything
      - In Terminal 1, 2, and 3:

   1      # First, clone the project (only needs to be done once)
   2      git clone
     https://github.com/your-username/blockchain-voting-system.git
   3      cd blockchain-voting-system
      - In Terminal 1 (for the `blockchain`):
   1      cd blockchain
   2      npm install
      - In Terminal 2 (for the `server`):

   1      cd server
   2      npm install
      - In Terminal 3 (for the `client`):
   1      cd client
   2      npm install

  Step 3: Start the Local Blockchain
      - In Terminal 1 (`blockchain`):

   1      npx hardhat node
      - What's happening? This command starts a private, local Ethereum
        blockchain on your computer. It will display a list of 20 sample
        accounts with their private keys. This is your secure, digital
        ledger.
      - Action: Keep this terminal running. Copy the private key of the ver
        first account.

  Step 4: Deploy the Smart Contract
      - Open a new Terminal 4:
   1      cd blockchain-voting-system/blockchain
   2      npx hardhat run scripts/deploy.js --network localhost
      - What's happening? This command takes the VeriVote.sol contract (the
        rulebook for our election) and places it onto your local blockchain.
        The output will say VeriVote deployed to: followed by an address.
      - Action: Copy the deployed contract address. You can now close
        Terminal 4.

  Step 5: Configure and Start the Server
      - In Terminal 2 (`server`):
        1. Create a new file named .env.
        2. Copy and paste the following into that file:

   1          MONGO_URI=mongodb://localhost:27017/verivote
   2          JWT_SECRET=your_secret_key
   3          GANACHE_RPC_URL=http://127.0.0.1:8545
   4          SERVER_WALLET_PRIVATE_KEY=<PASTE_THE_PRIVATE_KEY_FROM_STEP_3>
   5          CONTRACT_ADDRESS=<PASTE_THE_CONTRACT_ADDRESS_FROM_STEP_4>
        3. Crucially, replace the placeholders with the private key and
           contract address you copied.
        4. Now, run the following commands in Terminal 2:
   1          # This adds sample users (an admin and students) to the
     database
   2          npm run data:import
   3
   4          # This starts the server
   5          npm start
      - What's happening? The server is the bridge between the website and
        the blockchain. It manages user accounts and election details.

  Step 6: Start the Website
      - In Terminal 3 (`client`):
   1      npm run dev
      - What's happening? This starts the React frontend, which is the
        website you will interact with. It will give you a URL like
        http://localhost:5173.

  Step 7: Access the Application
      - Open your web browser and go to the URL from the previous step. You
        are now ready to use the application.

  ---

  Part 2: A Walkthrough of Using the Project

  Now that the project is running, here is a story of how an election
  happens.

  The Characters:
   * Dr. Evans: The college administrator.
   * Alice: A student who wants to vote.

  Scene 1: The Administrator Creates an Election
   1. Login: Dr. Evans goes to the website and logs in with the admin
      account:
       * Email: admin@verivote.com
       * Password: 123456
   2. Dashboard: He sees the "Admin Dashboard." He clicks a button to "Creae
       New Election."
   3. Create Election: He fills out a form:
       * Election Title: "President of the Student Council"
       * He then adds the candidates: "John Doe" and "Jane Smith."
   4. Start Election: Dr. Evans clicks "Start Election."
       * What's happening now? The server tells the smart contract on the
         blockchain to officially create and activate this election. The
         "rulebook" for this specific election is now live and ready to
         accept votes according to its strict rules.

  Scene 2: The Student Casts a Vote
   1. Login: Alice, a student, logs out and then logs back in with her
      student account:
       * Email: student1@verivote.com
       * Password: 123456
   2. Voting Portal: Alice sees the "Voting Portal." It shows the "President
      of the Student Council" election is active.
   3. Cast Vote: She clicks on the election. She sees the candidates, John
      Doe and Jane Smith. She decides to vote for Jane Smith and clicks the
      "Vote" button next to her name.
       * What's happening now? Her vote is sent to the smart contract on the
         blockchain. The contract does two things:
           1. It checks its records to see if Alice has already voted. Since
              she hasn't, it proceeds.
           2. It adds +1 to Jane Smith's vote count and, crucially, it
              records Alice's unique voter ID to its list of people who have
              already voted. This is the step that prevents her from ever
              voting again in this election.

  Scene 3: The System's Integrity in Action
   1. Alice Tries to Vote Again: Curious, Alice goes back to the voting page
      and tries to vote for John Doe this time.
   2. Vote Rejected: She clicks the "Vote" button, but a message pops up:
      "You have already voted in this election."
       * What's happening? The smart contract saw her voter ID, checked its
         records, found that she had already voted, and automatically
         rejected the second vote. This rule is enforced by code and cannot
         be bypassed by anyone, not even the administrator.

  Scene 4: Viewing the Tamper-Proof Results
   1. Election Ends: After a few days, the voting period is over.
   2. Admin Views Results: Dr. Evans logs back in and goes to the "Results"
      page for the election. He sees the final tally: Jane Smith won.
       * What's happening? The website is not just pulling numbers from a
         regular database. It is asking the smart contract on the blockchai,
         "What is the final, official count?" The results are read directly
         from the immutable, public ledger, ensuring they are 100% accurate
         and have not been tampered with.

  This entire process ensures a fair and transparent election. The blockchan
   acts as the ultimate source of truth, and the smart contract acts as the
  incorruptible election official who enforces the rules for everyone,
  automatically.

  ---------------------------------------------

   Registering election 69011217dae5883a606ff084 on blockchain...
  Activating election 69011217dae5883a606ff084 on blockchain...
  Blockchain state updated successfully. what's all these

✦ Those messages are the server's log, telling you about the important
  actions happening on the blockchain when an administrator starts an
  election. Let's break them down.

  The long string of numbers and letters, 69011217dae5883a606ff084, is the
   unique digital fingerprint (an ID) for the election you just created.

  Here’s what each message means:

   1. `Registering election 69011217dae5883a606ff084 on blockchain...`
       * What it means: The system is creating a new, blank page for this
         specific election in the "Magic Public Notebook" (the blockchain).
       * Action: This calls the createElection function in the smart
         contract. It officially tells the blockchain that a new election
         now exists and records how many candidates there are. At this
         moment, the election is created but is not yet open for voting.

   2. `Activating election 69011217dae5883a606ff084 on blockchain...`
       * What it means: The system is now putting a big "VOTING IS OPEN"
         stamp on that new page in the notebook.
       * Action: This calls the toggleElectionState function in the smart
         contract. This flips the switch for the election from "inactive" to
          "active." Now, the smart contract will start accepting votes for
         this election.

   3. `Blockchain state updated successfully.`
       * What it means: This is the confirmation message. It's like all the
         villagers nodding and confirming they've seen the new, active
         election in their copies of the notebook.
       * Action: It confirms that the two previous steps were successful and
          are now permanently recorded on the blockchain. The election is
         officially and securely underway.

  In short, those three lines are the digital equivalent of an election
  official formally announcing an election, declaring it open for voting,
  and getting confirmation that everyone has heard and recorded the
  announcement.

  ---------------------------------------------

  