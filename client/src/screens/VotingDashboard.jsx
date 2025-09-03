import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, Landmark, Loader2, AlertTriangle } from 'lucide-react';

// --- Reusable UI Components for this screen ---
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl border bg-card text-card-foreground shadow ${className}`}>
    <div className="p-6">{children}</div>
  </div>
);
const Button = ({ children, onClick, className = '', disabled = false }) => (
  <button onClick={onClick} disabled={disabled} className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-indigo-600 text-white shadow hover:bg-indigo-600/90 h-9 px-4 py-2 ${className}`}>
    {children}
  </button>
);
const CandidateCard = ({ candidate, onVote, disabled }) => (
  <div className={`rounded-xl border bg-card text-card-foreground shadow ${disabled ? 'opacity-60' : 'transition-transform transform hover:scale-105'}`}>
    <div className="p-6 flex flex-col items-center">
        <img src={`https://placehold.co/100x100/E2E8F0/4A5568?text=${candidate.user.name.charAt(0)}`} alt={candidate.user.name} className="w-24 h-24 rounded-full mb-4 border-4 border-gray-200" />
        <p className="font-bold text-lg mb-4">{candidate.user.name}</p>
        <Button onClick={() => onVote(candidate)} className="w-full" disabled={disabled}>Vote</Button>
    </div>
  </div>
);


const VotingDashboard = ({ userInfo, onLogout }) => {
    const [elections, setElections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [votedStates, setVotedStates] = useState({});

    useEffect(() => {
        const fetchElections = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                const { data } = await axios.get('http://localhost:5001/api/elections/my-section', config);
                setElections(data);
                // Check if user has already voted in any of these elections
                const initialVotedStates = {};
                data.forEach(election => {
                    if (election.voted.includes(userInfo._id)) {
                        initialVotedStates[election._id] = true;
                    }
                });
                setVotedStates(initialVotedStates);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch elections.');
            } finally {
                setLoading(false);
            }
        };

        if (userInfo) {
            fetchElections();
        }
    }, [userInfo]);

    const handleVote = async (electionId, candidateId) => {
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const body = { candidateId };
            await axios.post(`http://localhost:5001/api/elections/${electionId}/vote`, body, config);
            setVotedStates(prev => ({ ...prev, [electionId]: true }));
        } catch (err) {
            alert(`Vote failed: ${err.response?.data?.message || 'Server error'}`);
            console.error(err);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen text-gray-800">
            <header className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center">
                    <div className="flex items-center mb-2 sm:mb-0">
                        <Landmark className="text-indigo-600 mr-3 h-8 w-8" />
                        <h1 className="text-2xl font-bold text-indigo-600">College Voting Portal</h1>
                    </div>
                    <div className="text-center sm:text-right">
                        <p className="font-semibold">Welcome, {userInfo.name}</p>
                        <button onClick={onLogout} className="text-sm text-indigo-600 hover:underline">Logout</button>
                    </div>
                </div>
            </header>
            <main className="container mx-auto px-4 sm:px-6 py-8">
                <h2 className="text-3xl font-bold mb-6">Your Section's Elections</h2>
                {loading ? (
                    <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /><p className="ml-4 text-gray-600">Loading Elections...</p></div>
                ) : error ? (
                     <Card className="bg-red-50 border-red-200 flex items-center"><AlertTriangle className="h-5 w-5 text-red-500 mr-3"/><p className="text-red-700">{error}</p></Card>
                ) : (
                    <div className="space-y-8">
                        {elections.length === 0 ? ( <Card><p className="text-center text-gray-500">No active elections for your section at the moment.</p></Card> ) : (
                            elections.map((election) => (
                                <div key={election._id}>
                                    {votedStates[election._id] ? (
                                        <Card className="text-center"><ShieldCheck className="mx-auto h-16 w-16 text-green-500" /><h4 className="mt-4 text-2xl font-bold text-green-600">Thank You For Voting in "{election.title}"!</h4></Card>
                                    ) : (
                                        <Card>
                                            <div className="flex justify-between items-start"><h4 className="text-2xl font-bold text-indigo-700">{election.title}</h4><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ election.status === 'Completed' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800' }`}>{election.status}</span></div>
                                            <hr className="my-6" />
                                            {election.candidates.length > 0 ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                    {election.candidates.map((candidate) => (
                                                        <CandidateCard key={candidate._id} candidate={candidate} onVote={() => handleVote(election._id, candidate._id)} />
                                                    ))}
                                                </div>
                                            ) : (<p className="text-center text-gray-500">No candidates have been registered for this election yet.</p>)}
                                        </Card>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default VotingDashboard;