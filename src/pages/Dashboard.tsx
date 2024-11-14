import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { auth } from "../firebase";
import "../components/dashboard.css";
import { doc, getDoc, Timestamp, collection, getDocs } from "firebase/firestore";
import { database } from "../firebase";

interface UserData {
    firstName: string;
    lastName: string;
    squadron: string;
    nofearCompletionTime: Timestamp | null;
    recordsCompletionTime: Timestamp | null;
    stinfoCompletionTime: Timestamp | null;
    nofearProgress: number;
    recordsProgress: number;
    stinfoProgress: number;
    admin: boolean;
}

function Dashboard(): JSX.Element {
    const [errorMessage, setErrorMessage] = useState<string>("");
    const navigate = useNavigate();
    const [userData, setUserData] = useState<UserData | null>(null); // Initialize userData state
    const [allUserData, setAllUserData] = useState<UserData[] | null>(null); // State for all user data

    // Function to fetch individual user data by UID
    const getUserData = async (uid: string): Promise<UserData | null> => {
        try {
            const userDocRef = doc(database, "users", uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                return userDoc.data() as UserData;
            } else {
                throw new Error("User data not found.");
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            return null;
        }
    };

    // Function to fetch all user data (for admin users)
    const getAllUserData = async (): Promise<UserData[]> => {
        const usersCollectionRef = collection(database, "users");
        const userDocsSnapshot = await getDocs(usersCollectionRef);
        return userDocsSnapshot.docs.map((doc) => doc.data() as UserData);
    };

    useEffect(() => {
        const fetchData = async () => {
            const currentUser = auth.currentUser;

            if (!currentUser) {
                setErrorMessage("Please log in to access the dashboard page.");
                return;
            }

            try {
                const uid = currentUser.uid;
                const userData = await getUserData(uid);
                
                if (userData) {
                    setUserData(userData);

                    // If the user is an admin, fetch all users' data
                    if (userData.admin) {
                        const allUsers = await getAllUserData();
                        setAllUserData(allUsers);
                    }
                } else {
                    setErrorMessage("User data not found.");
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                setErrorMessage("An error occurred while fetching the data.");
            }
        };

        fetchData(); // Fetch user data when component mounts
    }, []); // Empty dependency array to run effect only once

    // Helper function to format completion time
    const formatCompletionTime = (completionTime: Timestamp | null) => {
        if (!completionTime || completionTime.seconds === 0) {
            return "Not Completed";
        }
        return new Date(completionTime.seconds * 1000).toLocaleString();
    };

    return (
        <>
            <Navbar />
            <div>
                {errorMessage ? (
                    <div className="text">
                        <p>{errorMessage}</p>
                    </div>
                ) : userData ? (
                    <>
                        <h1>Welcome, {userData.firstName}</h1>
                        <div style={{ textAlign: 'center' }}>
                            <div className="container">
                                <h2>Personal Data</h2>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>No Fear Act Completion Progress</th>
                                            <th>No Fear Act Completion Date</th>
                                            <th>Records Management Completion Progress</th>
                                            <th>Records Management Completion Date</th>
                                            <th>STINFO Completion Progress</th>
                                            <th>STINFO Completion Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>{userData.nofearProgress}</td>
                                            <td>{formatCompletionTime(userData.nofearCompletionTime)}</td>
                                            <td>{userData.recordsProgress}</td>
                                            <td>{formatCompletionTime(userData.recordsCompletionTime)}</td>
                                            <td>{userData.stinfoProgress}</td>
                                            <td>{formatCompletionTime(userData.stinfoCompletionTime)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <br></br>

                            {userData.admin ? (
                                <div>
                                    <div className="container">
                                        <h2>All User's Data</h2>
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Squadron</th>
                                                    <th>No Fear Act Completion Progress</th>
                                                    <th>No Fear Act Completion Date</th>
                                                    <th>Records Management Completion Progress</th>
                                                    <th>Records Management Completion Date</th>
                                                    <th>STINFO Completion Progress</th>
                                                    <th>STINFO Completion Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {allUserData && allUserData.map((user, key) => (
                                                    <tr key={key}>
                                                        <td>{user.lastName}, {user.firstName}</td>
                                                        <td>{user.squadron}</td>
                                                        <td>{user.nofearProgress}</td>
                                                        <td>{formatCompletionTime(user.nofearCompletionTime)}</td>
                                                        <td>{user.recordsProgress}</td>
                                                        <td>{formatCompletionTime(user.recordsCompletionTime)}</td>
                                                        <td>{user.stinfoProgress}</td>
                                                        <td>{formatCompletionTime(user.stinfoCompletionTime)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <p>You're a regular user.</p>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="text">
                        <p>Loading...</p>
                    </div>
                )}
            </div>
        </>
    );
}

export default Dashboard;
