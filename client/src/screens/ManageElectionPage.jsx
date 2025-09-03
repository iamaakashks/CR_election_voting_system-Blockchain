import { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, ArrowLeft, UserPlus, Trash2, ShieldCheck, AlertTriangle, PlayCircle, BarChart2 } from 'lucide-react';

// --- Helper function to format time ---
const formatTime = (ms) => {
    if (ms <= 0) return '00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
};

const ManageElectionPage = ({ electionId, onBack, userInfo, onNavigateToResults }) => {
    const [election, setElection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0); // For the countdown timer

    const fetchElection = async () => {
        try {
            setLoading(true);
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get(`http://localhost:5001/api/elections/${electionId}`, config);
            setElection(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch election details.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchElection();
    }, [electionId, userInfo.token]);
    
    // --- Countdown Timer Logic ---
    useEffect(() => {
        if (election?.status === 'Active' && election.endTime) {
            const interval = setInterval(() => {
                const remaining = new Date(election.endTime) - new Date();
                setTimeLeft(remaining > 0 ? remaining : 0);
                if (remaining <= 1000) { // When time is up
                    clearInterval(interval);
                    fetchElection(); // Refresh data to get "Completed" status
                }
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [election]);

    // --- Search Logic ---
    useEffect(() => {
    // If the search box is cleared, immediately clear the results and stop.
        if (searchQuery.trim() === '') {
            setSearchResults([]);
            setIsSearching(false);
            return; // Exit early
        }

        // A search term exists. Set the loading state.
        setIsSearching(true);

        const searchStudents = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                const { data } = await axios.get(
                    `http://localhost:5001/api/users/search?department=${election.department}&section=${election.section}&query=${searchQuery}`,
                    config
                );
                // Set the results from the API call
                setSearchResults(data);
            } catch (err) {
                console.error("Search failed:", err);
                setSearchResults([]); // Clear results if the search fails
            } finally {
                // Unset the loading state regardless of outcome
                setIsSearching(false);
            }
        };

        // Set a timeout to wait for the user to stop typing
        const debounceSearch = setTimeout(() => {
            if (election) {
                searchStudents();
            }
        }, 300); // 300ms delay

        // This cleanup function is crucial. It cancels the pending search if the user types again.
        return () => clearTimeout(debounceSearch);

    }, [searchQuery, election, userInfo.token]);

    const addCandidate = async (userId) => {
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.post(`http://localhost:5001/api/elections/${electionId}/candidates`, { userId }, config);
            fetchElection(); // Refresh election data to show new candidate
            setSearchQuery(''); // Clear search
            setSearchResults([]);
        } catch (err) {
            alert(`Error adding candidate: ${err.response?.data?.message}`);
        }
    };

    const handleStartElection = async () => {
        if (!window.confirm('Are you sure you want to start this election? This will begin a 15-minute timer and lock the candidate list.')) return;
        
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.put(`http://localhost:5001/api/elections/${electionId}/start`, {}, config);
            fetchElection(); // Refresh to get new status and timer
        } catch (err) {
            alert(`Error starting election: ${err.response?.data?.message}`);
        }
    };
    
    if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-indigo-600" /></div>;
    if (error) return <div className="p-8 text-center"><AlertTriangle className="mx-auto h-10 w-10 text-red-500"/><p className="mt-4 text-red-600">Error: {error}</p></div>;
    if (!election) return null;

    const isStartDisabled = election.status !== 'Pending' || election.candidates.length < 2 || election.candidates.length > 3;

    return (
        <div className="bg-gray-50 min-h-screen">
             <header className="bg-white shadow-sm border-b">
                 <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <button onClick={onBack} className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
                        <ArrowLeft className="mr-2 h-5 w-5" />
                        Back to Dashboard
                    </button>
                    <div className="text-right">
                        <p className="font-semibold">{userInfo.name}</p>
                        <p className="text-sm text-gray-500">Super Admin</p>
                    </div>
                </div>
            </header>
            <main className="container mx-auto px-6 py-8">
                 <h2 className="text-3xl font-bold text-gray-800">{election.title}</h2>
                 <p className="text-lg text-gray-500">{election.department} - Section {election.section}</p>
                 
                 <div className="grid md:grid-cols-3 gap-8 mt-8">
                    {/* Left Column: Candidates */}
                    <div className="md:col-span-2">
                        <div className="bg-white rounded-xl border shadow p-6">
                            <h3 className="text-xl font-bold mb-4">Registered Candidates ({election.candidates.length})</h3>
                            {election.candidates.length > 0 ? (
                                <ul className="divide-y divide-gray-200">
                                {election.candidates.map(c => (
                                    <li key={c._id} className="py-3 flex justify-between items-center">
                                        <div>
                                            <p className="font-medium text-gray-800">{c.user.name}</p>
                                            <p className="text-sm text-gray-500">{c.user.collegeId}</p>
                                        </div>
                                        {election.status === 'Pending' && (
                                            <button className="text-red-500 hover:text-red-700 disabled:opacity-50" title="Remove candidate (feature to be added)">
                                                <Trash2 size={20}/>
                                            </button>
                                        )}
                                    </li>
                                ))}
                                </ul>
                            ) : <p className="text-center py-4 text-gray-500">No candidates have been added yet.</p>}
                        </div>
                    </div>
                    {/* Right Column: Add Candidate & Actions */}
                    <div>
                         {/* Show Add Candidate only if election is Pending */}
                        {election.status === 'Pending' && (
                            <div className="bg-white rounded-xl border shadow p-6 mb-6">
                                <h3 className="text-xl font-bold mb-4 flex items-center"><UserPlus className="mr-2"/> Add Candidate</h3>
                                <input
                                    type="text"
                                    placeholder="Search student by name or ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full h-10 px-3 py-2 text-sm rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
                                />
                                {isSearching && <p className="text-sm text-gray-500 p-2">Searching...</p>}
                                {searchResults.length > 0 && (
                                    <ul className="divide-y divide-gray-200 border rounded-md max-h-48 overflow-y-auto bg-gray-50">
                                    {searchResults.map(user => (
                                        <li key={user._id} className="p-2 flex justify-between items-center hover:bg-gray-100">
                                            <div>
                                                <p className="text-sm font-medium">{user.name}</p>
                                                <p className="text-xs text-gray-500">{user.collegeId}</p>
                                            </div>
                                            <button onClick={() => addCandidate(user._id)} className="text-sm font-semibold text-indigo-600 hover:underline">Add</button>
                                        </li>
                                    ))}
                                    </ul>
                                )}
                            </div>
                        )}

                         <div className="bg-white rounded-xl border shadow p-6">
                            <h3 className="text-xl font-bold mb-4">Election Status</h3>
                            {election.status === 'Pending' && (
                                <>
                                    <button onClick={handleStartElection} disabled={isStartDisabled} className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-700 h-10 px-4 py-2 disabled:bg-gray-400 disabled:cursor-not-allowed">
                                        <PlayCircle className="mr-2"/> Start Election (15 min Timer)
                                    </button>
                                    {isStartDisabled && (
                                        <p className="text-xs text-red-600 mt-2 text-center">
                                            An election can only be started when it is 'Pending' and has 2 or 3 candidates.
                                        </p>
                                    )}
                                </>
                            )}
                            {election.status === 'Active' && (
                                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <p className="font-semibold text-blue-800">Election is Live!</p>
                                    <p className="text-4xl font-mono font-bold text-blue-900 my-2">{formatTime(timeLeft)}</p>
                                    <p className="text-sm text-blue-700">Time Remaining</p>
                                </div>
                            )}
                            {election.status === 'Completed' && (
                                <div className="text-center p-4 bg-gray-100 rounded-lg border">
                                    <p className="font-semibold text-gray-800">Election Completed</p>
                                    <button onClick={() => onNavigateToResults(election._id)} className="mt-4 w-full inline-flex items-center justify-center rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 h-10 px-4 py-2">
                                        <BarChart2 className="mr-2"/> View Final Results
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                 </div>
            </main>
        </div>
    );
};

export default ManageElectionPage;