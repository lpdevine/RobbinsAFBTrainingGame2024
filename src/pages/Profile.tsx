import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { auth, database } from "../firebase.ts";
import { useLocation } from 'react-router-dom';
import { getUserData, getAllUserData } from "../components/firestoreUtils.tsx";
import "../components/profile.css"
import "../components/dashboard.css"
import { Timestamp } from "firebase/firestore";

interface UserData {
    firstName: string;
    lastName: string;
    squadron: string;
    nofearCompletionTime: Timestamp;
    recordsCompletionTime: Timestamp;
    stinfoCompletionTime: Timestamp;
    nofearProgress: number;
    recordsProgress: number;
    stinfoProgress: number;
    admin: boolean;
}

function Profile(): JSX.Element {
    const [userData, setUserData] = useState<UserData | null>(null); 
    const [email, setEmail] = useState();
    const [allUserData, setAllUserData] = useState<UserData[] | null>()

    useEffect(() => {
        const fetchData = async () => {
            const userDataString = localStorage.getItem("userData");
            if (userDataString) {
                const userEmail = JSON.parse(userDataString);
                const userData = await getUserData(userEmail);
                const allUserData = await getAllUserData();
                setUserData(userData);
                setAllUserData(allUserData);
            }
        };

        fetchData(); // Fetch user data when component mounts
    }, []); // Empty dependency array to run effect only once

    return (
        <>
            <Navbar />
            <div>
            {userData ? (
                    <>
                        <div>
                            {userData.admin === true ? (
                                <>
                                    <div className="text">
                                        <h1>User Profile</h1>
                                        <h2>Welcome, {userData.firstName}</h2>
                                    </div>
                                    <div className="main-content">
                                        <div className="container">
                                            <h2 style={{ textAlign: 'center' }}>Edit User Profile</h2>
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th>Name</th>
                                                        <th>Squadron</th>
                                                        <th>Email</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        {/* This is temporary data, remove before Thursday */}
                                                        <th>Ryan, Nathan</th>
                                                        <th>SWE Group</th>
                                                        <th>nathanryan0424@gmail.com</th>
                                                    </tr>
                                                    {allUserData && allUserData.map((user, key) => (
                                                        <tr key={key}>
                                                            <td>{user.lastName}, {user.firstName}</td>
                                                            <td>{user.squadron}</td>
                                                            <td>{user.nofearProgress}</td>
                                                            <td>{email}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text">
                                    <h1>User Profile</h1>
                                    <h2>Must be logged in as "admin" to edit profile</h2>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="text">
                        <h1>User Profile</h1>
                        <h2>Please log in to view user profile</h2>
                    </div>
                )}
            </div>
        </>
    )
}
export default Profile;