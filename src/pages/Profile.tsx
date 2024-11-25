import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { auth } from "../firebase";
import "../components/profile.css";
import { doc, getDoc, collection, getDocs, updateDoc } from "firebase/firestore";
import { database } from "../firebase";

interface UserData {
    id: string; // Ensure Firestore ID is included for updates
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

    // Popup state
    const [showPopup, setShowPopup] = useState<boolean>(false);
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

    // Fetch current user data by UID
    const getUserData = async (uid: string): Promise<UserData | null> => {
        try {
            const userDocRef = doc(database, "users", uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const data = userDoc.data();
                // Validate Firestore data
                if (
                    typeof data.firstName === "string" &&
                    typeof data.lastName === "string" &&
                    typeof data.squadron === "string" &&
                    typeof data.email === "string" &&
                    typeof data.admin === "boolean"
                ) {
                    return { ...data, id: userDoc.id } as UserData;
                } else {
                    console.error("Invalid user data format:", data);
                    return null;
                }
            }
            return null;
        } catch (error) {
            console.error("Error fetching user data:", error);
            return null;
        }
    };

    // Fetch all user data (for admin users)
    const getAllUserData = async (): Promise<UserData[]> => {
        try {
            const usersCollectionRef = collection(database, "users");
            const userDocsSnapshot = await getDocs(usersCollectionRef);
            return userDocsSnapshot.docs.map((doc) => ({
                ...doc.data(),
                id: doc.id, // Include Firestore ID
            })) as UserData[];
        } catch (error) {
            console.error("Error fetching all user data:", error);
            return [];
        }
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
                (typeof user.firstName === "string" &&
                    user.firstName.toLowerCase().includes(nameSearch.toLowerCase())) ||
                (typeof user.lastName === "string" &&
                    user.lastName.toLowerCase().includes(nameSearch.toLowerCase()));
            const squadronMatch =
                typeof user.squadron === "string" &&
                user.squadron.toLowerCase().includes(squadronSearch.toLowerCase());
            return nameMatch && squadronMatch;
        });
        setFilteredUserData(filteredData);
    };

    // Clear search fields
    const handleClearSearch = () => {
        setNameSearch("");
        setSquadronSearch("");
        setFilteredUserData(allUserData);
    };

    // Show popup for admin toggle confirmation
    const handleToggleAdmin = (user: UserData) => {
        setSelectedUser(user);
        setShowPopup(true);
    };

    // Confirm admin toggle
    const confirmToggleAdmin = async () => {
        if (!selectedUser) return;

        try {
            const updatedAdminStatus = !selectedUser.admin;
            const userDocRef = doc(database, "users", selectedUser.id);
            await updateDoc(userDocRef, { admin: updatedAdminStatus });

            // Update state
            const updatedUsers = allUserData.map((u) =>
                u.id === selectedUser.id ? { ...u, admin: updatedAdminStatus } : u
            );
            setAllUserData(updatedUsers);
            setFilteredUserData(updatedUsers);

            // Close popup
            setShowPopup(false);
        } catch (error) {
            console.error("Error updating admin status:", error);
        }
    };

    // Cancel admin toggle
    const cancelToggleAdmin = () => {
        setShowPopup(false);
        setSelectedUser(null);
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

                                            {/* Search Bar */}
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

                                            {/* Users Table */}
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th className="th">Name</th>
                                                        <th className="th">Squadron</th>
                                                        <th className="th">Admin</th>
                                                        <th className="th">Email</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredUserData.map((user) => (
                                                        <tr key={user.id}>
                                                            <td className="td">
                                                                {user.lastName},<br />
                                                                {user.firstName}
                                                            </td>
                                                            <td className="td">{user.squadron}</td>
                                                            <td className="td">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={user.admin}
                                                                    onChange={() => handleToggleAdmin(user)}
                                                                />
                                                            </td>
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

                        {/* Popup Window */}
                        {showPopup && selectedUser && (
                            <div className="popup-overlay">
                                <div className="popup-content">
                                    <h3>
                                        Are you sure you want to{" "}
                                        {selectedUser.admin ? "revoke" : "grant"} admin privileges for{" "}
                                        {selectedUser.firstName} {selectedUser.lastName}?
                                    </h3>
                                    <div className="popup-buttons">
                                        <button className="popup-confirm" onClick={confirmToggleAdmin}>
                                            Confirm
                                        </button>
                                        <button className="popup-cancel" onClick={cancelToggleAdmin}>
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
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
