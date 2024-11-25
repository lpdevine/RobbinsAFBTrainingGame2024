import Navbar from "../components/Navbar";
import { useState, useEffect } from "react";
import { auth } from "../firebase";
import "../components/dashboard.css";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { database } from "../firebase";

interface UserData {
    firstName: string;
    lastName: string;
    squadron: string;
    nofearProgress: number;
    recordsProgress: number;
    stinfoProgress: number;
    admin: boolean;
}

function Dashboard(): JSX.Element {
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [userData, setUserData] = useState<UserData | null>(null);
    const [allUserData, setAllUserData] = useState<UserData[]>([]);
    const [filteredUserData, setFilteredUserData] = useState<UserData[]>([]);
    const [nameSearch, setNameSearch] = useState<string>("");
    const [squadronSearch, setSquadronSearch] = useState<string>("");

    // Function to fetch individual user data by UID
    const getUserData = async (uid: string): Promise<UserData | null> => {
        try {
            const userDocRef = doc(database, "users", uid);
            const userDoc = await getDoc(userDocRef);
            return userDoc.exists() ? (userDoc.data() as UserData) : null;
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

            const uid = currentUser.uid;
            const userData = await getUserData(uid);

            if (userData) {
                setUserData(userData);

                // If the user is an admin, fetch all users' data
                if (userData.admin) {
                    const allUsers = await getAllUserData();
                    setAllUserData(allUsers);
                    setFilteredUserData(allUsers);
                }
            } else {
                setErrorMessage("User data not found.");
            }
        };

        fetchData();
    }, []);

    // Handle search functionality
    const handleSearch = () => {
        const filteredData = allUserData.filter((user) => {
            const nameMatch =
                user.firstName.toLowerCase().includes(nameSearch.toLowerCase()) ||
                user.lastName.toLowerCase().includes(nameSearch.toLowerCase());
            const squadronMatch = user.squadron.toLowerCase().includes(squadronSearch.toLowerCase());

            return nameMatch && squadronMatch;
        });
        setFilteredUserData(filteredData);
    };

    // Handle clearing the search input fields
    const handleClearSearch = () => {
        setNameSearch("");
        setSquadronSearch("");
        setFilteredUserData(allUserData);
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
                        {userData.admin ? (
                            <div className="main-content">
                                <div className="container">
                                    <h2 className="table-name">All User's Data</h2>
                                    <div className="search-bar">
                                        <input
                                            type="text"
                                            placeholder="Search Name"
                                            className="input"
                                            value={nameSearch}
                                            onChange={(e) => setNameSearch(e.target.value)}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Search Squadron"
                                            className="input"
                                            value={squadronSearch}
                                            onChange={(e) => setSquadronSearch(e.target.value)}
                                        />
                                        <button onClick={handleSearch}>
                                            Search
                                        </button>
                                        <button onClick={handleClearSearch}>
                                            Clear
                                        </button>
                                    </div>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th className="th">Name</th>
                                                <th className="th">Squadron</th>
                                                <th className="th">Admin</th>
                                                <th className="th">No Fear Act Progress %</th>
                                                <th className="th">Records Management Progress %</th>
                                                <th className="th">STINFO Progress %</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredUserData.map((user, index) => (
                                                <tr key={index}>
                                                    <td className="td">
                                                        {user.lastName},<br />
                                                        {user.firstName}
                                                    </td>
                                                    <td className="td">{user.squadron}</td>
                                                    <td className="td">{user.admin ? "Yes" : "No"}</td>
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
                                        <h2 className="table-name">Personal Data</h2>
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th className="th">No Fear Act Completion Progress</th>
                                                    <th className="th">Records Management Completion Progress</th>
                                                    <th className="th">STINFO Completion Progress</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td className="td">{userData.nofearProgress}</td>
                                                    <td className="td">{userData.recordsProgress}</td>
                                                    <td className="td">{userData.stinfoProgress}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                    </>
                ) : (
                    <div className="text">
                        <h1>Dashboard</h1>
                        <h2>{errorMessage}</h2>
                    </div>
                )}
            </div>
        </>
    );
}

export default Dashboard;