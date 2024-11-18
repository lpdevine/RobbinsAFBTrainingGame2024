import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { auth } from "../firebase";
import "../components/profile.css";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { database } from "../firebase";

interface UserData {
    firstName: string;
    lastName: string;
    squadron: string;
    email: string;
    admin: boolean;
}

function Profile(): JSX.Element {
    const [errorMessage, setErrorMessage] = useState<string>("");
    const navigate = useNavigate();
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
                setErrorMessage("Please log in to view profile");
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
                        setFilteredUserData(allUsers);
                    }
                } else {
                    setErrorMessage("User data not found.");
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                setErrorMessage("An error occurred while fetching the data.");
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
                        <div>
                            {userData.admin ? (
                                <>
                                    <div className="text">
                                        <h1>User Profile</h1>
                                        <h2>Welcome, {userData.firstName}</h2>
                                    </div>
                                    <div className="profile-main-content">
                                        <div className="profile-container">
                                            <h2 className="table-name">All Users</h2>
                                            
                                            {/* Search Bar for Admins */}
                                            <div className="search-bar">
                                                <input
                                                    type="text"
                                                    placeholder="Search by Name"
                                                    className="input"
                                                    value={nameSearch}
                                                    onChange={(e) => setNameSearch(e.target.value)}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Search by Squadron"
                                                    className="input"
                                                    value={squadronSearch}
                                                    onChange={(e) => setSquadronSearch(e.target.value)}
                                                />
                                                <button className="dashboard-button" onClick={handleSearch}>
                                                    Search
                                                </button>
                                                <button className="dashboard-button" onClick={handleClearSearch}>
                                                    Clear
                                                </button>
                                            </div>

                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th className="th">Name</th>
                                                        <th className="th">Squadron</th>
                                                        <th className="th">Email</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredUserData.map((user, key) => (
                                                        <tr key={key}>
                                                            <td className="td">
                                                                {user.lastName},<br />
                                                                {user.firstName}
                                                            </td>
                                                            <td className="td">{user.squadron}</td>
                                                            <td className="td">{user.email}</td>
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
    );
}

export default Profile;