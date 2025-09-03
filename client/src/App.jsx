import { useState, useEffect } from 'react';
import LandingPage from './screens/LandingPage';
import LoginScreen from './screens/LoginScreen';
import VotingDashboard from './screens/VotingDashboard';
import AdminDashboard from './screens/AdminDashboard';
import ManageElectionPage from './screens/ManageElectionPage';
import ResultsPage from './screens/ResultPage';

function App() {
    const [userInfo, setUserInfo] = useState(null);
    const [view, setView] = useState({ page: 'landing', data: null });

    useEffect(() => {
        const storedUserInfo = localStorage.getItem('userInfo');
        if (storedUserInfo) {
            setUserInfo(JSON.parse(storedUserInfo));
            // If user is logged in, default to their dashboard
            const user = JSON.parse(storedUserInfo);
            setView({ page: user.role === 'SuperAdmin' ? 'adminDashboard' : 'studentDashboard', data: null });
        }
    }, []);

    const loginSuccessHandler = (data) => {
        localStorage.setItem('userInfo', JSON.stringify(data));
        setUserInfo(data);
        setView({ page: data.role === 'SuperAdmin' ? 'adminDashboard' : 'studentDashboard', data: null });
    };

    const logoutHandler = () => {
        localStorage.removeItem('userInfo');
        setUserInfo(null);
        setView({ page: 'landing', data: null });
    };

    const renderPage = () => {
        if (!userInfo) {
            // Public views
            if (view.page === 'login') return <LoginScreen onLoginSuccess={loginSuccessHandler} onBack={() => setView({ page: 'landing' })} />;
            return <LandingPage onLoginClick={() => setView({ page: 'login' })} />;
        }

        // Logged-in views
        switch (view.page) {
            case 'adminDashboard':
                return <AdminDashboard userInfo={userInfo} onLogout={logoutHandler} onNavigateToManage={(id) => setView({ page: 'manageElection', data: id })} />;
            case 'manageElection':
                return <ManageElectionPage electionId={view.data} userInfo={userInfo} onBack={() => setView({ page: 'adminDashboard' })} onNavigateToResults={(id) => setView({ page: 'results', data: id })} />;
            case 'results':
                return <ResultsPage electionId={view.data} userInfo={userInfo} onBack={() => setView({ page: 'manageElection', data: view.data })} />;
            case 'studentDashboard':
                return <VotingDashboard userInfo={userInfo} onLogout={logoutHandler} />;
            default:
                return <LandingPage onLoginClick={() => setView({ page: 'login' })} />;
        }
    };

    return <>{renderPage()}</>;
}

export default App;