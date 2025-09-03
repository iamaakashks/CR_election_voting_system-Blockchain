import { useState } from 'react';
import axios from 'axios';
import { Landmark } from 'lucide-react';

// Reusable UI Components from our main App.jsx
const Button = ({ children, onClick, className = '', type = 'button' }) => (
  <button onClick={onClick} type={type} className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-indigo-600 text-white shadow hover:bg-indigo-600/90 h-9 px-4 py-2 ${className}`}>
    {children}
  </button>
);

const Input = (props) => (
    <input {...props} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" />
);

const LoginScreen = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const submitHandler = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            const { data } = await axios.post(
                'http://localhost:5001/api/users/login',
                { email, password },
                config
            );

            // If login is successful, call the function passed from App.jsx
            onLoginSuccess(data);

        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred.');
            console.error('Login error:', err.response?.data || err.message);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md">
                 <div className="flex justify-center items-center mb-6">
                    <Landmark className="text-indigo-600 mr-3 h-10 w-10" />
                    <h1 className="text-3xl font-bold text-indigo-600">Voting Portal Login</h1>
                </div>

                <div className="rounded-xl border bg-white p-6 sm:p-8 shadow-md">
                    <form onSubmit={submitHandler}>
                        {error && <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                <Input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your.email@college.edu"
                                    required
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                <Input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        <Button type="submit" className="w-full mt-6">
                            Sign In
                        </Button>
                    </form>
                </div>
                 <p className="mt-4 text-center text-sm text-gray-500">
                    Don't have an account? Contact your administrator.
                </p>
            </div>
        </div>
    );
};

export default LoginScreen;