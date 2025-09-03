import { useState, useEffect } from 'react';
import axios from 'axios';
import { Award, Loader2 } from 'lucide-react';

const LandingPage = ({ onLoginClick }) => {
    const [winnerInfo, setWinnerInfo] = useState(null);
    const [loadingWinner, setLoadingWinner] = useState(true);

    useEffect(() => {
        const fetchWinner = async () => {
            try {
                const { data } = await axios.get('http://localhost:5001/api/elections/latest-winner');
                if (data && data.winnerName) {
                    setWinnerInfo(data);
                }
            } catch (error) {
                console.error("Could not fetch latest winner:", error);
            } finally {
                setLoadingWinner(false);
            }
        };
        fetchWinner();
    }, []);

    const WinnerBanner = () => {
        if (loadingWinner) {
            return (
                <div className="bg-indigo-700 text-white py-3">
                    <div className="container mx-auto px-6 text-center flex items-center justify-center">
                        <Loader2 className="animate-spin mr-2" size={20}/>
                        <span>Checking for latest election results...</span>
                    </div>
                </div>
            );
        }

        if (!winnerInfo) {
            return null; // Don't show a banner if there's no winner yet
        }

        return (
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 shadow-lg">
                <div className="container mx-auto px-6 text-center">
                    <div className="flex items-center justify-center">
                        <Award className="mr-3 h-6 w-6 text-amber-300" />
                        <p className="font-semibold">
                            Congratulations to <span className="font-bold underline">{winnerInfo.winnerName}</span>, the new CR for {winnerInfo.department} - Section {winnerInfo.section}!
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white text-gray-800 antialiased">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200">
                <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <a href="#" className="flex items-center space-x-2">
                        <svg className="h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-2xl font-bold text-gray-900">VeriVote</span>
                    </a>
                    <div className="hidden md:flex items-center space-x-6">
                        <a href="#how-it-works" className="text-gray-600 hover:text-indigo-600 transition">How It Works</a>
                        <a href="#features" className="text-gray-600 hover:text-indigo-600 transition">Features</a>
                        <a href="#tech" className="text-gray-600 hover:text-indigo-600 transition">Technology</a>
                    </div>
                    <button onClick={onLoginClick} className="bg-indigo-600 text-white font-semibold px-5 py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm hover:shadow-lg">
                        Login to Vote
                    </button>
                </nav>
            </header>
            
            <WinnerBanner />

            {/* Hero Section */}
            <main>
                <section className="py-20 md:py-32" style={{ backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
                    <div className="container mx-auto px-6 text-center">
                        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight">
                            Secure, Transparent, and Modern Elections
                        </h1>
                        <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                            VeriVote brings the power of blockchain to your college's internal elections, ensuring every vote is counted securely and results are verifiable by all.
                        </p>
                        <div className="mt-10">
                            <button onClick={onLoginClick} className="bg-indigo-600 text-white font-semibold px-8 py-4 rounded-lg hover:bg-indigo-700 transition-transform transform hover:scale-105 shadow-lg">
                                Proceed to Portal
                            </button>
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section id="how-it-works" className="py-20 bg-white">
                    <div class="container mx-auto px-6">
                        <div class="text-center mb-16">
                            <h2 class="text-3xl md:text-4xl font-bold text-gray-900">A Hybrid Approach to Voting</h2>
                            <p class="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">We combine a fast, traditional web application with a secure blockchain ledger for the best of both worlds.</p>
                        </div>
                        <div class="grid md:grid-cols-3 gap-10 text-center">
                            <div class="p-8 border border-gray-200 rounded-2xl shadow-sm hover:shadow-xl transition-shadow">
                                <div class="flex items-center justify-center h-16 w-16 mx-auto bg-indigo-100 rounded-full mb-6">
                                <svg class="h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                </div>
                                <h3 class="text-xl font-bold mb-2">1. Secure Login</h3>
                                <p class="text-gray-600">Students and admins log in through a secure, centralized portal. We manage user profiles and election details efficiently off-chain.</p>
                            </div>
                            <div class="p-8 border border-gray-200 rounded-2xl shadow-sm hover:shadow-xl transition-shadow">
                                <div class="flex items-center justify-center h-16 w-16 mx-auto bg-indigo-100 rounded-full mb-6">
                                    <svg class="h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15M9 12l3 3m0 0l3-3m-3 3V2.25" /></svg>
                                </div>
                                <h3 class="text-xl font-bold mb-2">2. Cast Your Vote</h3>
                                <p class="text-gray-600">When you cast your vote, the request is sent to our server, which then creates a transaction on the blockchain. This is your digital ballot.</p>
                            </div>
                            <div class="p-8 border border-gray-200 rounded-2xl shadow-sm hover:shadow-xl transition-shadow">
                                <div class="flex items-center justify-center h-16 w-16 mx-auto bg-indigo-100 rounded-full mb-6">
                                    <svg class="h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.158.79.44 1.086m0 0l3.375 3.375m-3.375-3.375l-3.375 3.375M21 12.75l-3.375-3.375m3.375 3.375l-3.375 3.375M3.375 12.75l3.375-3.375m-3.375 3.375l3.375 3.375m14.25-3.375l-3.375-3.375m3.375 3.375l-3.375 3.375M4.5 21.75l3.375-3.375m-3.375 3.375l3.375 3.375m14.25-3.375l-3.375-3.375m3.375 3.375l-3.375 3.375M12 21.75l3.375-3.375m-3.375 3.375l-3.375 3.375" /></svg>
                                </div>
                                <h3 class="text-xl font-bold mb-2">3. Verifiable Results</h3>
                                <p class="text-gray-600">The vote is recorded permanently on the blockchain. The smart contract tallies the results, which can be publicly verified for ultimate transparency.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" class="py-20 bg-gray-50">
                    <div class="container mx-auto px-6">
                        <div class="grid md:grid-cols-2 gap-16 items-center">
                            <div class="space-y-8">
                                <div>
                                    <span class="font-bold text-indigo-600">TRUST & SECURITY</span>
                                    <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Why Choose a Blockchain-Based System?</h2>
                                    <p class="mt-4 text-lg text-gray-600">Traditional voting systems rely on trust in a central authority. We replace that trust with cryptographic proof.</p>
                                </div>
                                <div class="space-y-6">
                                    <div class="flex items-start space-x-4">
                                    <div class="flex-shrink-0 h-8 w-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">✓</div>
                                    <div>
                                        <h4 class="font-semibold text-lg">Immutable Ballots</h4>
                                        <p class="text-gray-600">Once a vote is cast on the blockchain, it cannot be altered, deleted, or tampered with by anyone.</p>
                                    </div>
                                    </div>
                                    <div class="flex items-start space-x-4">
                                    <div class="flex-shrink-0 h-8 w-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">✓</div>
                                    <div>
                                        <h4 class="font-semibold text-lg">Transparent Verification</h4>
                                        <p class="text-gray-600">The final tally is managed by the smart contract, allowing for independent verification of results without revealing individual votes.</p>
                                    </div>
                                    </div>
                                    <div class="flex items-start space-x-4">
                                    <div class="flex-shrink-0 h-8 w-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">✓</div>
                                    <div>
                                        <h4 class="font-semibold text-lg">Section-Specific Elections</h4>
                                        <p class="text-gray-600">Our system is designed to handle multiple, simultaneous elections for different departments and sections with ease.</p>
                                    </div>
                                    </div>
                                </div>
                            </div>
                            <div class="p-8 bg-white rounded-2xl shadow-2xl">
                                <div class="bg-gray-900 rounded-lg p-4 text-sm font-mono text-green-400">
                                    <p>&gt; <span class="text-white">tx.vote(candidate: 1)</span></p>
                                    <p class="opacity-70">Transaction sent: 0xabc...def</p>
                                    <p class="opacity-70">Waiting for confirmation...</p>
                                    <p class="text-green-400">✔ Success! Vote recorded in block #12345.</p>
                                    <br/>
                                    <p>&gt; <span class="text-white">contract.getVoteCount(candidate: 1)</span></p>
                                    <p class="text-green-400">uint256: 1</p>
                                </div>
                                <p class="mt-4 text-center text-gray-600">Your vote is more than just data—it's a secure transaction.</p>
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* Technology Section */}
                <section id="tech" class="py-20 bg-white">
                    <div class="container mx-auto px-6 text-center">
                        <h2 class="text-3xl font-bold text-gray-900">Built with Modern Technology</h2>
                        <p class="mt-4 text-lg text-gray-600">Leveraging industry-standard tools for a robust and scalable solution.</p>
                        <div class="mt-12 flex flex-wrap justify-center items-center gap-x-12 gap-y-8">
                            <span class="font-semibold text-gray-500">React</span>
                            <span class="font-semibold text-gray-500">Node.js</span>
                            <span class="font-semibold text-gray-500">MongoDB</span>
                            <span class="font-semibold text-gray-500">Solidity</span>
                            <span class="font-semibold text-gray-500">Ethers.js</span>
                            <span class="font-semibold text-gray-500">Tailwind CSS</span>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-gray-900 text-white">
                <div className="container mx-auto px-6 py-8 text-center">
                    <p>&copy; 2025 VeriVote. A Major Project Showcase.</p>
                    <p className="text-sm text-gray-400 mt-2">Built for the Department of Computer Science & Engineering.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;