import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { auth, database } from "../firebase";
import "../components/profile.css";
import { doc, getDoc, Timestamp } from "firebase/firestore";

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

async function getUserData(uid: string): Promise<UserData | null> {
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
}

function Profile() {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const currentUser = auth.currentUser;

                if (!currentUser) {
                    setErrorMessage("User is not logged in.");
                    return;
                }

                const uid = currentUser.uid;
                const data = await getUserData(uid);

                if (data) {
                    setUserData(data);
                } else {
                    setErrorMessage("User data not found.");
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                setErrorMessage("Error fetching user data.");
            }
        };

        fetchData();
    }, []);

    return (
        <>
            <Navbar />
            <div>
                <h1>Edit My User Profile</h1>
            </div>
            <div>
                {errorMessage ? (
                    <div className="text">
                        <p>{errorMessage}</p>
                    </div>
                ) : userData ? (
                    <>
                        <div style={{ textAlign: 'center' }}>
                            <h2>Name: {userData.firstName} {userData.lastName}</h2>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <h2>Email: {auth.currentUser?.email}</h2>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <h2>Squadron: {userData.squadron}</h2>
                        </div>
                    </>
                ) : (
                    <div className="text">
                        <p>Sign In To Access User Profile</p>
                    </div>
                )}
            </div>
        </>
    );
}

export default Profile;
