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
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch results.');
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [electionId, userInfo.token]);

    if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-indigo-600" /></div>;
    if (error) return <div className="text-red-600 p-8">{error}</div>;
    if (!results) return null;

    const { electionDetails, blockchainResults } = results;
    const winner = electionDetails.candidates.reduce((p, c) => (p.votes > c.votes ? p : c));

    return (
        <div className="bg-gray-50 min-h-screen">
            <header className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <button onClick={onBack} className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
                        <ArrowLeft className="mr-2 h-5 w-5" /> Back to Manage
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">Election Results</h1>
                    <div className="text-right"><p className="font-semibold">{userInfo.name}</p><p className="text-sm text-gray-500">Super Admin</p></div>
                </div>
            </header>
            <main className="container mx-auto px-6 py-8">
                <div className="bg-white rounded-xl border shadow p-8 text-center mb-8">
                    <Award className="mx-auto h-16 w-16 text-amber-500" />
                    <p className="text-lg text-gray-600 mt-4">The winner of</p>
                    <h2 className="text-3xl font-bold text-indigo-600">{electionDetails.title}</h2>
                    <p className="text-2xl font-bold text-gray-800 mt-2">{winner.user.name}</p>
                    <p className="text-gray-500">with {winner.votes} vote(s)</p>
                </div>

                <div className="bg-white rounded-xl border shadow p-6">
                    <h3 className="text-xl font-bold mb-4">Final Tally</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Database Tally</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Blockchain Verified</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Verification</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {electionDetails.candidates.sort((a,b) => b.votes - a.votes).map((candidate, index) => {
                                    const bcResult = blockchainResults.find(bcr => bcr.id.toString() === candidate.user._id.toString());
                                    const isVerified = bcResult && bcResult.votes === candidate.votes;
                                    return (
                                        <tr key={candidate._id}>
                                            <td className="px-6 py-4 whitespace-nowrap"><div className="font-medium text-gray-900">{candidate.user.name}</div><div className="text-sm text-gray-500">{candidate.user.collegeId}</div></td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-lg font-bold">{candidate.votes}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-lg font-bold">{bcResult ? bcResult.votes : 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                {isVerified ? <CheckCircle2 className="h-6 w-6 text-green-500 mx-auto" /> : <p className="text-red-500">Mismatch</p>}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};
export default ResultsPage;