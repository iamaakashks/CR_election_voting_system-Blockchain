import { useState, useEffect } from 'react';
import LandingPage from './screens/LandingPage';
import LoginScreen from './screens/LoginScreen';
import VotingDashboard from './screens/VotingDashboard';
import AdminDashboard from './screens/AdminDashboard';
import ManageElectionPage from './screens/ManageElectionPage';
import ResultsPage from './screens/ResultPage';

// Main application component that handles routing based on user's login status and role.
function App() {
    // State to hold the current user's information (null if not logged in).
    const [userInfo, setUserInfo] = useState(null);
    // State to manage which page/view is currently active.
    const [view, setView] = useState({ page: 'landing', data: null });

    // This effect runs once when the app first loads.
    // It checks if user info is already stored in the browser's localStorage.
    useEffect(() => {
        const storedUserInfo = localStorage.getItem('userInfo');
        if (storedUserInfo) {
            const user = JSON.parse(storedUserInfo);
            setUserInfo(user);
            // If a user is found, take them directly to their appropriate dashboard.
            setView({ page: user.role === 'SuperAdmin' ? 'adminDashboard' : 'studentDashboard', data: null });
        }
    }, []);

    // Handler for successful login. Saves user info to state and localStorage.
    const loginSuccessHandler = (data) => {
        localStorage.setItem('userInfo', JSON.stringify(data));
        setUserInfo(data);
        setView({ page: data.role === 'SuperAdmin' ? 'adminDashboard' : 'studentDashboard', data: null });
    };

    // Handler for logout. Clears user info and returns to the landing page.
    const logoutHandler = () => {
        localStorage.removeItem('userInfo');
        setUserInfo(null);
        setView({ page: 'landing', data: null });
    };

    // Main render function that decides which screen to show.
    const renderPage = () => {
        // If no user is logged in, show public pages.
        if (!userInfo) {
            if (view.page === 'login') return <LoginScreen onLoginSuccess={loginSuccessHandler} onBack={() => setView({ page: 'landing' })} />;
            return <LandingPage onLoginClick={() => setView({ page: 'login' })} />;
        }

        // If a user is logged in, show the appropriate private screen.
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
                // Default to the user's dashboard if the view state is unknown.
                return userInfo.role === 'SuperAdmin' ? <AdminDashboard userInfo={userInfo} onLogout={logoutHandler} onNavigateToManage={(id) => setView({ page: 'manageElection', data: id })} /> : <VotingDashboard userInfo={userInfo} onLogout={logoutHandler} />;
        }
    };

    return <>{renderPage()}</>;
}

export default App;