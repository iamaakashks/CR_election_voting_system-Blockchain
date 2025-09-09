import { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, ArrowLeft, UserPlus, Trash2, AlertTriangle, PlayCircle, BarChart2 } from 'lucide-react';

// --- NEW, 100% RELIABLE AVATAR GENERATION ---
// This function creates a unique SVG avatar locally, without any external API calls.
const generateAvatarDataUrl = (name) => {
    const hash = name.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
    const colors = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#6366f1', '#818cf8', '#a5b4fc'];
    const eyeColors = ['#f1f5f9', '#e2e8f0', '#cffafe'];

    const bgColor = colors[Math.abs(hash) % colors.length];
    const eyeColor = eyeColors[Math.abs(hash * 3) % eyeColors.length];
    const mouthType = Math.abs(hash * 5) % 3; // 0 for smile, 1 for neutral, 2 for surprised

    let mouthPath;
    if (mouthType === 0) {
        mouthPath = 'M 30 70 Q 50 85 70 70'; // Smile
    } else if (mouthType === 1) {
        mouthPath = 'M 30 75 L 70 75'; // Neutral
    } else {
        mouthPath = '<circle cx="50" cy="75" r="8" fill="none" stroke="#1e293b" stroke-width="4"/>'; // Surprised
    }

    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
            <rect width="100" height="100" rx="20" fill="${bgColor}" />
            <circle cx="35" cy="45" r="8" fill="${eyeColor}" />
            <circle cx="65" cy="45" r="8" fill="${eyeColor}" />
            ${mouthType === 2 ? mouthPath : `<path d="${mouthPath}" stroke="#1e293b" stroke-width="5" fill="none" stroke-linecap="round"/>`}
        </svg>
    `;
    // Convert the SVG string to a Base64 data URL to use in the <img> tag.
    return `data:image/svg+xml;base64,${btoa(svg)}`;
};


const formatTime = (ms) => { if (ms <= 0) return '00:00'; const s = Math.floor(ms / 1000); const m = Math.floor(s / 60).toString().padStart(2, '0'); return `${m}:${(s % 60).toString().padStart(2, '0')}`; };

const ManageElectionPage = ({ electionId, onBack, userInfo, onNavigateToResults }) => {
    const [election, setElection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);

    const fetchElection = async () => { try { setLoading(true); const config = { headers: { Authorization: `Bearer ${userInfo.token}` } }; const { data } = await axios.get(`http://localhost:5001/api/elections/${electionId}`, config); setElection(data); } catch (err) { setError(err.response?.data?.message || 'Failed to fetch election details.'); } finally { setLoading(false); } };
    useEffect(() => { fetchElection(); }, [electionId, userInfo.token]);
    useEffect(() => { if (election?.status === 'Active' && election.endTime) { const i = setInterval(() => { const r = new Date(election.endTime) - new Date(); setTimeLeft(r > 0 ? r : 0); if (r <= 1000) { clearInterval(i); fetchElection(); } }, 1000); return () => clearInterval(i); } }, [election]);
    useEffect(() => { if (searchQuery.trim() === '') { setSearchResults([]); setIsSearching(false); return; } setIsSearching(true); const s = async () => { try { const config = { headers: { Authorization: `Bearer ${userInfo.token}` } }; const { data } = await axios.get(`http://localhost:5001/api/users/search?department=${election.department}&section=${election.section}&query=${searchQuery}`, config); setSearchResults(data); } catch (e) { console.error(e); setSearchResults([]); } finally { setIsSearching(false); } }; const d = setTimeout(() => { if (election) s(); }, 300); return () => clearTimeout(d); }, [searchQuery, election, userInfo.token]);
    const addCandidate = async (userId) => { try { const config = { headers: { Authorization: `Bearer ${userInfo.token}` } }; await axios.post(`http://localhost:5001/api/elections/${electionId}/candidates`, { userId }, config); fetchElection(); setSearchQuery(''); setSearchResults([]); } catch (err) { alert(`Error adding candidate: ${err.response?.data?.message}`); } };
    const handleStartElection = async () => { if (!window.confirm('Are you sure you want to start this election? This will begin a 15-minute timer and lock the candidate list.')) return; try { const config = { headers: { Authorization: `Bearer ${userInfo.token}` } }; await axios.put(`http://localhost:5001/api/elections/${electionId}/start`, {}, config); fetchElection(); } catch (err) { alert(`Error starting election: ${err.response?.data?.message}`); } };
    
    if (loading) return <div className="flex bg-slate-900 justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-violet-500" /></div>;
    if (error) return <div className="bg-slate-900 text-red-400 p-8 text-center"><AlertTriangle className="mx-auto h-10 w-10 text-red-500"/><p className="mt-4">Error: {error}</p></div>;
    if (!election) return null;

    const isStartDisabled = election.status !== 'Pending' || election.candidates.length < 2 || election.candidates.length > 3;

    return (
        <div className="bg-slate-900 min-h-screen text-slate-200">
            <header className="bg-slate-900/70 backdrop-blur-md sticky top-0 z-10 border-b border-slate-800"><div className="container mx-auto px-6 py-4 flex justify-between items-center"><button onClick={onBack} className="flex items-center text-violet-400 hover:text-violet-300 font-medium transition-colors"><ArrowLeft className="mr-2 h-5 w-5" />Back to Dashboard</button><div className="text-right"><p className="font-semibold text-white">{userInfo.name}</p><p className="text-sm text-slate-400">Super Admin</p></div></div></header>
            <main className="container mx-auto px-6 py-8"><h2 className="text-3xl font-bold text-white">{election.title}</h2><p className="text-lg text-slate-400">{election.department} - Section {election.section}</p><div className="grid md:grid-cols-3 gap-8 mt-8"><div className="md:col-span-2"><div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-lg p-6"><h3 className="text-xl font-bold text-white mb-4">Registered Candidates ({election.candidates.length})</h3>
                {election.candidates.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {election.candidates.map(c => (
                            <div key={c._id} className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 text-center relative transition-colors hover:border-violet-500/50">
                                <img src={generateAvatarDataUrl(c.user.name)} alt={c.user.name} className="w-20 h-20 rounded-lg mb-3 mx-auto" />
                                <p className="font-medium text-slate-100">{c.user.name}</p>
                                <p className="text-sm text-slate-400">{c.user.collegeId}</p>
                                {election.status === 'Pending' && <button className="absolute top-2 right-2 text-red-500 hover:text-red-400 disabled:opacity-50" title="Remove candidate"><Trash2 size={18}/></button>}
                            </div>
                        ))}
                    </div>
                ) : <p className="text-center py-4 text-slate-500">No candidates have been added yet.</p>}
            </div></div><div>{election.status === 'Pending' && <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-lg p-6 mb-6"><h3 className="text-xl font-bold text-white mb-4 flex items-center"><UserPlus className="mr-2"/> Add Candidate</h3><input type="text" placeholder="Search student by name or ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full h-10 px-3 py-2 text-sm rounded-md border-2 border-slate-700 bg-slate-900 text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 mb-2"/>{isSearching && <p className="text-sm text-slate-500 p-2">Searching...</p>}{searchResults.length > 0 && <ul className="divide-y divide-slate-700 border border-slate-700 rounded-md max-h-48 overflow-y-auto bg-slate-900">{searchResults.map(user => (<li key={user._id} className="p-2 flex justify-between items-center hover:bg-slate-800"><div><p className="text-sm font-medium text-white">{user.name}</p><p className="text-xs text-slate-400">{user.collegeId}</p></div><button onClick={() => addCandidate(user._id)} className="text-sm font-semibold text-violet-400 hover:underline">Add</button></li>))}</ul>}</div>}<div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-lg p-6"><h3 className="text-xl font-bold text-white mb-4">Election Status</h3>{election.status === 'Pending' && <><button onClick={handleStartElection} disabled={isStartDisabled} className="w-full inline-flex items-center justify-center rounded-lg text-sm font-semibold bg-green-600 text-white hover:bg-green-700 h-10 px-4 py-2 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"><PlayCircle className="mr-2"/>Start Election</button>{isStartDisabled && <p className="text-xs text-red-400 mt-2 text-center">Requires 2 or 3 candidates to start.</p>}</>}{election.status === 'Active' && <div className="text-center p-4 bg-blue-900/50 rounded-lg border border-blue-500/50"><p className="font-semibold text-blue-300">Election is Live!</p><p className="text-4xl font-mono font-bold text-white my-2">{formatTime(timeLeft)}</p><p className="text-sm text-blue-400">Time Remaining</p></div>}{election.status === 'Completed' && <div className="text-center p-4 bg-slate-700/50 rounded-lg border border-slate-700"><p className="font-semibold text-white">Election Completed</p><button onClick={() => onNavigateToResults(election._id)} className="mt-4 w-full inline-flex items-center justify-center rounded-lg text-sm font-semibold bg-violet-600 text-white hover:bg-violet-700 h-10 px-4 py-2 transition-all duration-300 shadow-lg shadow-violet-600/20"><BarChart2 className="mr-2"/>View Final Results</button></div>}</div></div></div></main>
        </div>
    );
};
export default ManageElectionPage;