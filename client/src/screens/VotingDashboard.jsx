import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, Loader2, AlertTriangle } from 'lucide-react';

const VeriVoteLogo = () => ( <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="20" fill="url(#paint0_linear_1_2)"/><path d="M12 20.5L17.5 26L28.5 15" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><defs><linearGradient id="paint0_linear_1_2" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse"><stop stopColor="#8B5CF6"/><stop offset="1" stopColor="#6366F1"/></linearGradient></defs></svg> );
const Card = ({ children, className = '' }) => <div className={`bg-slate-800 rounded-2xl border border-slate-700 border-b-4 border-b-slate-600 shadow-lg ${className}`}><div className="p-6">{children}</div></div>;
const Button = ({ children, onClick, className = '', disabled = false }) => <button onClick={onClick} disabled={disabled} className={`w-full inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-violet-500 disabled:pointer-events-none disabled:opacity-50 bg-violet-600 text-white shadow-lg shadow-violet-600/20 hover:bg-violet-700 hover:shadow-xl hover:shadow-violet-600/30 h-10 px-4 py-2 transform hover:-translate-y-0.5 ${className}`}>{children}</button>;

// --- NEW, 100% RELIABLE AVATAR GENERATION ---
const generateAvatarDataUrl = (name) => {
    const hash = name.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
    const colors = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#6366f1', '#818cf8', '#a5b4fc'];
    const eyeColors = ['#f1f5f9', '#e2e8f0', '#cffafe'];
    const bgColor = colors[Math.abs(hash) % colors.length];
    const eyeColor = eyeColors[Math.abs(hash * 3) % eyeColors.length];
    const mouthType = Math.abs(hash * 5) % 3;
    let mouthPath;
    if (mouthType === 0) { mouthPath = 'M 30 70 Q 50 85 70 70'; } else if (mouthType === 1) { mouthPath = 'M 30 75 L 70 75'; } else { mouthPath = '<circle cx="50" cy="75" r="8" fill="none" stroke="#1e293b" stroke-width="4"/>'; }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="${bgColor}" /><circle cx="35" cy="45" r="8" fill="${eyeColor}" /><circle cx="65" cy="45" r="8" fill="${eyeColor}" />${mouthType === 2 ? mouthPath : `<path d="${mouthPath}" stroke="#1e293b" stroke-width="5" fill="none" stroke-linecap="round"/>`}</svg>`;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
};


const CandidateCard = ({ candidate, onVote }) => (
    <div className="bg-slate-800/50 rounded-2xl border border-slate-700 text-center p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-violet-600/20 hover:border-violet-500">
        <img src={generateAvatarDataUrl(candidate.user.name)} alt={candidate.user.name} className="w-24 h-24 rounded-xl mb-4 mx-auto" />
        <p className="font-bold text-lg text-white mb-4">{candidate.user.name}</p>
        <Button onClick={() => onVote(candidate)}>Vote</Button>
    </div>
);

const VotingDashboard = ({ userInfo, onLogout }) => {
    const [elections, setElections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [votedStates, setVotedStates] = useState({});

    useEffect(() => { const fetchElections = async () => { try { const config = { headers: { Authorization: `Bearer ${userInfo.token}` } }; const { data } = await axios.get('http://localhost:5001/api/elections/my-section', config); setElections(data); const initialVotedStates = {}; data.forEach(election => { if (election.voted.includes(userInfo._id)) initialVotedStates[election._id] = true; }); setVotedStates(initialVotedStates); } catch (err) { setError(err.response?.data?.message || 'Failed to fetch elections.'); } finally { setLoading(false); } }; if (userInfo) fetchElections(); }, [userInfo]);
    const handleVote = async (electionId, candidateId) => { try { const config = { headers: { Authorization: `Bearer ${userInfo.token}` } }; const body = { candidateId }; await axios.post(`http://localhost:5001/api/elections/${electionId}/vote`, body, config); setVotedStates(prev => ({ ...prev, [electionId]: true })); } catch (err) { alert(`Vote failed: ${err.response?.data?.message || 'Server error'}`); } };

    return (
        <div className="bg-slate-900 min-h-screen text-slate-200">
            <header className="bg-slate-900/70 backdrop-blur-md sticky top-0 z-10 border-b border-slate-800"><div className="container mx-auto px-6 py-4 flex justify-between items-center"><div className="flex items-center space-x-3"><VeriVoteLogo /><h1 className="text-xl font-bold text-white">Voting Portal</h1></div><div className="text-right"><p className="font-semibold text-white">Welcome, {userInfo.name}</p><button onClick={onLogout} className="text-sm text-violet-400 hover:underline">Logout</button></div></div></header>
            <main className="container mx-auto px-4 sm:px-6 py-8">
                <h2 className="text-3xl font-bold mb-6 text-white">Your Section's Active Elections</h2>
                {loading ? <div className="flex justify-center items-center h-64 text-slate-400"><Loader2 className="h-8 w-8 animate-spin text-violet-500" /><p className="ml-4">Loading Elections...</p></div> : 
                 error ? <Card className="bg-red-900/50 border-red-500/50 flex items-center"><AlertTriangle className="h-5 w-5 text-red-400 mr-3"/><p className="text-red-300">{error}</p></Card> :
                <div className="space-y-8">{elections.length === 0 ? <Card><p className="text-center text-slate-400">No active elections for your section at the moment.</p></Card> :
                 elections.map((election) => (<div key={election._id}>{votedStates[election._id] ? <Card className="text-center bg-gradient-to-br from-slate-800 to-slate-900"><ShieldCheck className="mx-auto h-16 w-16 text-green-400" /><h4 className="mt-4 text-2xl font-bold text-green-400">Thank You For Voting in "{election.title}"!</h4><p className="text-slate-400 mt-2">Your vote has been securely and permanently recorded on the blockchain.</p></Card> :
                 <Card><div className="flex justify-between items-start"><h4 className="text-2xl font-bold text-white">{election.title}</h4><span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${ election.status === 'Active' ? 'bg-green-500/20 text-green-300' : 'bg-slate-700 text-slate-300' }`}>{election.status}</span></div><hr className="my-6 border-slate-700" />{election.candidates.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{election.candidates.map((candidate) => (<CandidateCard key={candidate._id} candidate={candidate} onVote={() => handleVote(election._id, candidate._id)} />))}</div> : <p className="text-center text-slate-400">No candidates have been registered for this election yet.</p>}</Card>}</div>))}</div>}
            </main>
        </div>
    );
};
export default VotingDashboard;