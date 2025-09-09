import { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, ArrowLeft, Award, CheckCircle2 } from 'lucide-react';

const ResultsPage = ({ electionId, onBack, userInfo }) => {
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                const { data } = await axios.get(`http://localhost:5001/api/elections/${electionId}/results`, config);
                setResults(data);
            } catch (err) { setError(err.response?.data?.message || 'Failed to fetch results.'); } finally { setLoading(false); }
        };
        fetchResults();
    }, [electionId, userInfo.token]);

    if (loading) return <div className="flex bg-slate-900 justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-violet-500" /></div>;
    if (error) return <div className="bg-slate-900 text-red-400 p-8">{error}</div>;
    if (!results) return null;

    const { electionDetails, blockchainResults } = results;
    const winner = electionDetails.candidates.reduce((p, c) => (p.votes > c.votes ? p : c));

    return (
        <div className="bg-slate-900 min-h-screen text-slate-200">
            <header className="bg-slate-900/70 backdrop-blur-md sticky top-0 z-10 border-b border-slate-800"><div className="container mx-auto px-6 py-4 flex justify-between items-center"><button onClick={onBack} className="flex items-center text-violet-400 hover:text-violet-300 font-medium transition-colors"><ArrowLeft className="mr-2 h-5 w-5" />Back to Manage</button><h1 className="text-xl font-bold text-white">Election Results</h1><div className="text-right"><p className="font-semibold text-white">{userInfo.name}</p><p className="text-sm text-slate-400">Super Admin</p></div></div></header>
            <main className="container mx-auto px-6 py-8">
                <div className="bg-slate-800 rounded-2xl border border-slate-700 border-b-4 border-b-amber-500 shadow-lg p-8 text-center mb-8">
                    <Award className="mx-auto h-16 w-16 text-amber-400" />
                    <p className="text-lg text-slate-400 mt-4">The winner of</p>
                    <h2 className="text-3xl font-bold text-white">{electionDetails.title}</h2>
                    <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400 mt-2">{winner.user.name}</p>
                    <p className="text-slate-400">with <span className="font-bold text-white">{winner.votes}</span> vote(s)</p>
                </div>
                <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-lg p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Final Tally Verification</h3>
                    <div className="overflow-x-auto"><table className="min-w-full"><thead className="border-b border-slate-700"><tr><th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Candidate</th><th className="px-6 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Database Tally</th><th className="px-6 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Blockchain Tally</th><th className="px-6 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Verification</th></tr></thead><tbody className="divide-y divide-slate-700">
                    {electionDetails.candidates.sort((a,b) => b.votes - a.votes).map((candidate) => {
                        const bcResult = blockchainResults.find(bcr => bcr.id.toString() === candidate.user._id.toString());
                        const isVerified = bcResult && bcResult.votes === candidate.votes;
                        return (<tr key={candidate._id} className="hover:bg-slate-800/50"><td className="px-6 py-4 whitespace-nowrap"><div className="font-medium text-white">{candidate.user.name}</div><div className="text-sm text-slate-400">{candidate.user.collegeId}</div></td><td className="px-6 py-4 whitespace-nowrap text-center text-lg font-bold text-slate-300">{candidate.votes}</td><td className="px-6 py-4 whitespace-nowrap text-center text-lg font-bold text-violet-400">{bcResult ? bcResult.votes : 'N/A'}</td><td className="px-6 py-4 whitespace-nowrap text-center">{isVerified ? <CheckCircle2 className="h-6 w-6 text-green-400 mx-auto" title="Verified" /> : <p className="text-red-400">Mismatch</p>}</td></tr>);
                    })}</tbody></table></div>
                </div>
            </main>
        </div>
    );
};
export default ResultsPage;