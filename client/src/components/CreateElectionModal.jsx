import { useState } from 'react';
import axios from 'axios';
import { X, Loader2 } from 'lucide-react';

const DEPARTMENTS = ['CSE', 'CSE(AI&ML)', 'ISE'];
const SECTIONS = ['A', 'B', 'C', 'D'];
const Button = ({ children, onClick, className = '', type = 'button', disabled = false }) => <button onClick={onClick} type={type} disabled={disabled} className={`inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-violet-500 disabled:pointer-events-none disabled:opacity-50 bg-violet-600 text-white shadow-lg shadow-violet-600/20 hover:bg-violet-700 hover:shadow-xl hover:shadow-violet-600/30 h-10 px-4 py-2 transform hover:-translate-y-0.5 ${className}`}>{children}</button>;
const Input = (props) => <input {...props} className="flex h-10 w-full rounded-md border-2 border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 ring-offset-slate-900 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2" />;
const Select = ({ children, ...props }) => <select {...props} className="flex h-10 w-full items-center justify-between rounded-md border-2 border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 ring-offset-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2">{children}</select>;

const CreateElectionModal = ({ isOpen, onClose, userInfo, onElectionCreated }) => {
    const [title, setTitle] = useState('');
    const [department, setDepartment] = useState('');
    const [section, setSection] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault(); setLoading(true); setError('');
        if (!department || !section) { setError('Please select a department and section.'); setLoading(false); return; }
        try {
            const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.post('http://localhost:5001/api/elections', { title, department, section }, config);
            onElectionCreated(data); onClose(); setTitle(''); setDepartment(''); setSection('');
        } catch (err) { setError(err.response?.data?.message || 'Failed to create election.'); } finally { setLoading(false); }
    };

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 backdrop-blur-sm">
            <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700">
                <div className="p-6 border-b border-slate-700 flex justify-between items-center"><h2 className="text-xl font-bold text-white">Create New Election</h2><button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><X size={24} /></button></div>
                <form onSubmit={handleSubmit} className="p-6">
                    {error && <div className="mb-4 rounded-md bg-red-900/50 border border-red-500/50 p-3 text-sm text-red-300">{error}</div>}
                    <div className="space-y-4">
                        <div><label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-1">Election Title</label><Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., CR Election Fall 2025" required /></div>
                        <div><label htmlFor="department" className="block text-sm font-medium text-slate-300 mb-1">Department</label><Select id="department" value={department} onChange={(e) => setDepartment(e.target.value)} required><option value="" disabled>Select a department</option>{DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}</Select></div>
                        <div><label htmlFor="section" className="block text-sm font-medium text-slate-300 mb-1">Section</label><Select id="section" value={section} onChange={(e) => setSection(e.target.value)} required><option value="" disabled>Select a section</option>{SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</Select></div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                            {loading ? <Loader2 className="animate-spin" /> : 'Create Election'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default CreateElectionModal;