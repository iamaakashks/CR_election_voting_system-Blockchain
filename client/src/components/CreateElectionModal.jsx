import { useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

// --- Predefined data for dropdowns ---
const DEPARTMENTS = ['CSE', 'CSE(AI&ML)', 'ISE'];
const SECTIONS = ['A', 'B', 'C', 'D'];

// --- Reusable components for the form ---
const Button = ({ children, onClick, className = '', type = 'button', disabled = false }) => (
    <button onClick={onClick} type={type} disabled={disabled} className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 bg-indigo-600 text-white shadow hover:bg-indigo-700 h-10 px-4 py-2 ${className}`}>
        {children}
    </button>
);

const Input = (props) => (
    <input {...props} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
);

// New Select component for dropdowns
const Select = ({ children, ...props }) => (
    <select {...props} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
        {children}
    </select>
);


const CreateElectionModal = ({ isOpen, onClose, userInfo, onElectionCreated }) => {
    const [title, setTitle] = useState('');
    const [department, setDepartment] = useState(''); // Default to empty
    const [section, setSection] = useState('');       // Default to empty
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!department || !section) {
            setError('Please select a department and section.');
            setLoading(false);
            return;
        }

        try {
            const config = {
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` },
            };
            const { data } = await axios.post('http://localhost:5001/api/elections', { title, department, section }, config);
            onElectionCreated(data);
            onClose(); // Close the modal
            // Reset form for next time
            setTitle('');
            setDepartment('');
            setSection('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create election.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold">Create New Election</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"> <X size={24} /> </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6">
                    {error && <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Election Title</label>
                            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., CR Election Fall 2025" required />
                        </div>
                        {/* --- Department Dropdown --- */}
                        <div>
                            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                            <Select id="department" value={department} onChange={(e) => setDepartment(e.target.value)} required>
                                <option value="" disabled>Select a department</option>
                                {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                            </Select>
                        </div>
                        {/* --- Section Dropdown --- */}
                        <div>
                            <label htmlFor="section" className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                            <Select id="section" value={section} onChange={(e) => setSection(e.target.value)} required>
                                <option value="" disabled>Select a section</option>
                                {SECTIONS.map(sec => <option key={sec} value={sec}>{sec}</option>)}
                            </Select>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Election'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateElectionModal;