import { useState } from 'react';
import axios from 'axios';
import { ArrowLeft, LogIn, Loader2 } from 'lucide-react';

const VeriVoteLogo = () => ( <svg width="48" height="48" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="20" fill="url(#paint0_linear_1_2)"/><path d="M12 20.5L17.5 26L28.5 15" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><defs><linearGradient id="paint0_linear_1_2" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse"><stop stopColor="#8B5CF6"/><stop offset="1" stopColor="#6366F1"/></linearGradient></defs></svg> );
const Button = ({ children, onClick, className = '', type = 'button', disabled = false }) => <button onClick={onClick} type={type} disabled={disabled} className={`w-full inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-violet-500 disabled:pointer-events-none disabled:opacity-50 bg-violet-600 text-white shadow-lg shadow-violet-600/20 hover:bg-violet-700 hover:shadow-xl hover:shadow-violet-600/30 h-10 px-4 py-2 transform hover:-translate-y-0.5 ${className}`}>{children}</button>;
const Input = (props) => <input {...props} className="flex h-10 w-full rounded-md border-2 border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 ring-offset-slate-900 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2" />;

const LoginScreen = ({ onLoginSuccess, onBack }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const submitHandler = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { data } = await axios.post('http://localhost:5001/api/users/login', { email, password });
            onLoginSuccess(data);
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred.');
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 p-4">
            <div className="absolute top-6 left-6"><button onClick={onBack} className="flex items-center text-slate-400 hover:text-violet-400 font-medium transition-colors"><ArrowLeft className="mr-2 h-5 w-5" />Back to Home</button></div>
            <div className="w-full max-w-md">
                <div className="flex flex-col items-center justify-center mb-6"><VeriVoteLogo /><h1 className="text-3xl font-bold text-white mt-4">Portal Login</h1></div>
                <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6 sm:p-8 shadow-2xl">
                    <form onSubmit={submitHandler}>
                        {error && <div className="mb-4 rounded-md bg-red-900/50 border border-red-500/50 p-3 text-sm text-red-300">{error}</div>}
                        <div className="space-y-4">
                            <div><label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">Email Address</label><Input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your.email@college.edu" required /></div>
                            <div><label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">Password</label><Input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required /></div>
                        </div>
                        <Button type="submit" className="mt-6" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin" /> : <><LogIn className="mr-2" size={16}/> Sign In</>}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};
export default LoginScreen;