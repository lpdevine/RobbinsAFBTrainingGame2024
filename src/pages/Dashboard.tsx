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
                setErrorMessage("Please log in to view dashboard");
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
                {userData ? (
                    <>
                        <div className="text">
                            <h1>Dashboard</h1>
                            <h2>Welcome, {userData.firstName}</h2>
                        </div>
                        <div>
                            {userData.admin === true ? (
                                <div className="main-content">
                                    <div className="container">
                                        <h2 className="table-name">All User's Data</h2>
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th className="th">Name</th>
                                                    <th className="th">Squadron</th>
                                                    <th className="th">No Fear Act Completion Progress %</th>
                                                    <th className="th">Records Management Completion Progress %</th>
                                                    <th className="th">STINFO Completion Progress %</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {allUserData && allUserData.map((user, key) => (
                                                    <tr key={key}>
                                                        <td className="td">{user.lastName},<br></br>{user.firstName}</td>
                                                        <td className="td">{user.squadron}</td>
                                                        <td className="td">{user.nofearProgress}</td>
                                                        <td className="td">{user.recordsProgress}</td>
                                                        <td className="td">{user.stinfoProgress}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="main-content">
                                    <div className="container">
                                        <h2 style={{ textAlign: 'center' }}>Personal Data</h2>
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>No Fear Act Completion Progress</th>
                                                    <th>Records Management Completion Progress</th>
                                                    <th>STINFO Completion Progress</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>{userData.nofearProgress}</td>
                                                    <td>{userData.recordsProgress}</td>
                                                    <td>{userData.stinfoProgress}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="text">
                        <h1>Dashboard</h1>
                        <h2>Please log in to view dashboard</h2>
                    </div>
                )}
            </div>
        </>
    );    
}
export default Dashboard;