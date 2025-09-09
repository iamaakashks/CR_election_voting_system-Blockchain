import { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Loader2, AlertTriangle } from 'lucide-react';
import CreateElectionModal from '../components/CreateElectionModal';

const VeriVoteLogo = () => ( <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="20" fill="url(#paint0_linear_1_2)"/><path d="M12 20.5L17.5 26L28.5 15" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><defs><linearGradient id="paint0_linear_1_2" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse"><stop stopColor="#8B5CF6"/><stop offset="1" stopColor="#6366F1"/></linearGradient></defs></svg> );

const AdminDashboard = ({ userInfo, onLogout, onNavigateToManage }) => {
    const [elections, setElections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchElections = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                const { data } = await axios.get('http://localhost:5001/api/elections', config);
                setElections(data);
            } catch (err) { setError(err.response?.data?.message || 'Failed to fetch elections.'); } finally { setLoading(false); }
        };
        fetchElections();
    }, [userInfo.token]);
    
    const handleElectionCreated = (newElection) => setElections([newElection, ...elections]);

    return (
        <>
            <CreateElectionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} userInfo={userInfo} onElectionCreated={handleElectionCreated} />
            <div className="bg-slate-900 min-h-screen text-slate-200">
                <header className="bg-slate-900/70 backdrop-blur-md sticky top-0 z-10 border-b border-slate-800"><div className="container mx-auto px-6 py-4 flex justify-between items-center"><div className="flex items-center space-x-3"><VeriVoteLogo /><h1 className="text-xl font-bold text-white">Admin Dashboard</h1></div><div className="text-right"><p className="font-semibold text-white">{userInfo.name}</p><button onClick={onLogout} className="text-sm text-violet-400 hover:underline">Logout</button></div></div></header>
                <main className="container mx-auto px-6 py-8">
                    <div className="flex justify-between items-center mb-6"><h2 className="text-3xl font-bold text-white">Manage Elections</h2><button onClick={() => setIsModalOpen(true)} className="inline-flex items-center justify-center rounded-lg text-sm font-semibold bg-violet-600 text-white hover:bg-violet-700 h-10 px-4 py-2 transition-all duration-300 shadow-lg shadow-violet-600/20 hover:shadow-xl hover:shadow-violet-600/30 transform hover:-translate-y-0.5"><PlusCircle className="mr-2 h-5 w-5" />Create Election</button></div>
                    <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-lg">
                        {loading ? <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin text-violet-500" /></div> : 
                         error ? <div className="text-red-400 flex items-center p-4"><AlertTriangle className="mr-2"/>{error}</div> :
                        <div className="overflow-x-auto"><table className="min-w-full"><thead className="border-b border-slate-700"><tr><th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Title</th><th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Department</th><th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Section</th><th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th><th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th></tr></thead><tbody className="divide-y divide-slate-700">
                        {elections.map((election) => (<tr key={election._id} className="hover:bg-slate-800/50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{election.title}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{election.department}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{election.section}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm"><span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${ election.status === 'Completed' ? 'bg-red-500/20 text-red-300' : election.status === 'Active' ? 'bg-green-500/20 text-green-300' : 'bg-amber-500/20 text-amber-300' }`}>{election.status}</span></td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium"><button onClick={() => onNavigateToManage(election._id)} className="text-violet-400 hover:text-violet-300 font-semibold">Manage</button></td>
                        </tr>))}</tbody></table></div>}
                    </div>
                </main>
            </div>
        </>
    );
};
export default AdminDashboard;