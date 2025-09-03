import { useState, useEffect } from 'react';
import axios from 'axios';
import { Landmark, PlusCircle, Loader2, AlertTriangle } from 'lucide-react';
import CreateElectionModal from '../components/CreateElectionModal'; // Import the modal

const AdminDashboard = ({ userInfo, onLogout, onNavigateToManage }) => {
    const [elections, setElections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility

    const fetchElections = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get('http://localhost:5001/api/elections', config);
            setElections(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch elections.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchElections();
    }, [userInfo.token]);

    const handleElectionCreated = (newElection) => {
        // Add the new election to the top of the list without a full refresh
        setElections([newElection, ...elections]);
    };

    return (
        <>
            <CreateElectionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                userInfo={userInfo}
                onElectionCreated={handleElectionCreated}
            />
            <div className="bg-gray-50 min-h-screen">
                <header className="bg-white shadow-sm border-b">
                    <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <Landmark className="text-indigo-600 h-8 w-8" />
                            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
                        </div>
                        <div className="text-right">
                            <p className="font-semibold">{userInfo.name}</p>
                            <button onClick={onLogout} className="text-sm text-indigo-600 hover:underline">Logout</button>
                        </div>
                    </div>
                </header>

                <main className="container mx-auto px-6 py-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-3xl font-bold text-gray-800">Manage Elections</h2>
                        <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 h-10 px-4 py-2">
                            <PlusCircle className="mr-2 h-5 w-5" />
                            Create Election
                        </button>
                    </div>

                    <div className="bg-white rounded-xl border shadow p-6">
                        {/* The table display logic remains the same */}
                        {loading ? (
                            <div className="flex justify-center items-center py-8"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>
                        ) : error ? (
                            <div className="text-red-600 flex items-center"><AlertTriangle className="mr-2"/>{error}</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    {/* Table Head */}
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    {/* Table Body */}
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {elections.map((election) => (
                                            <tr key={election._id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{election.title}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{election.department}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{election.section}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ election.status === 'Completed' ? 'bg-red-100 text-red-800' : election.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800' }`}>{election.status}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button onClick={() => onNavigateToManage(election._id)} className="text-indigo-600 hover:text-indigo-900">Manage</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
};

export default AdminDashboard;