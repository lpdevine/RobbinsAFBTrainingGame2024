import { useNavigate } from 'react-router-dom';
import './components.css';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { getUserData } from './firestoreUtils';
import { useState, useEffect } from 'react';

interface UserData {
    firstName: string;
    lastName: string;
    squadron: string;
    // Add other properties as needed
}

function Navbar() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const currentUser = auth.currentUser;
            if (currentUser) {
                const userEmail = currentUser.email;
                if (userEmail) {
                    const userData = await getUserData(userEmail);
                    setUserData(userData);
                }
            }
        };
        fetchData();
    }, []);

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    const handleSignOut = () => {
        localStorage.clear();
        signOut(auth);
        navigate('/signin');
    };

    return (
        <div className="navbar">
            {/* Top section for main navigation buttons */}
            <div className="navbar-top">
                <div className="floatLeft libutton" onClick={() => navigate('/dashboard')}> Home</div> {/* Home redirects to Dashboard */}
                <div className="floatLeft libutton" onClick={() => navigate('/stinfo')}> STINFO</div>
                <div className="floatLeft libutton" onClick={() => navigate('/nofear')}> No Fear Act</div>
                <div className="floatLeft libutton" onClick={() => navigate('/records')}> Records Management</div>
            </div>

            {/* Bottom section for Sign In and Profile */}
            <div className="navbar-bottom">
                <div className="floatRight libutton" onClick={toggleDropdown}>
                    {userData ? userData.firstName : 'Profile'}
                    {showDropdown && (
                        <div className="dropdown-content">
                            <div onClick={() => navigate('/dashboard')}>Dashboard</div>
                            <div onClick={() => navigate('/profile')}>Profile</div>
                            <div onClick={() => navigate('/certificates')}>Certificates</div>
                        </div>
                    )}
                </div>
                <div className="floatRight libutton" onClick={auth.currentUser ? handleSignOut : () => navigate('/signin')}>
                    {auth.currentUser ? 'Sign Out' : 'Sign In'}
                </div>
            </div>
        </div>
    );
}

export default Navbar;
