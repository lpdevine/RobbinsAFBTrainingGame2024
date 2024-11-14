import Navbar from "../components/Navbar";
import { useState, useEffect } from "react";
import { auth, database } from "../firebase";
import { collection, getDocs, DocumentData, doc, getDoc } from "firebase/firestore";
import "../components/certs.css";
import "../components/dashboard.css";
import DownloadCertificate from "../components/DownloadCertificate";
import ViewCertificate from "../components/ViewCertificate";
import { Timestamp } from "firebase/firestore";

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

function Certs() {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [certsData, setCertsData] = useState<DocumentData[]>([]);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const currentUser = auth.currentUser;
                if (!currentUser) {
                    setErrorMessage("User is not logged in.");
                    return;
                }

                const uid = currentUser.uid;
                const userDocRef = doc(database, "users", uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    setUserData(userDoc.data() as UserData);
                } else {
                    setErrorMessage("User data not found.");
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                setErrorMessage("Error fetching user data. Please try again.");
            }
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        const fetchCerts = async () => {
            try {
                const currentUser = auth.currentUser;
                if (!currentUser) {
                    setErrorMessage("User is not logged in.");
                    return;
                }

                const uid = currentUser.uid;
                const certsCollectionRef = collection(database, "users", uid, "certs");
                const certsSnapshot = await getDocs(certsCollectionRef);
                const certsData = certsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setCertsData(certsData);
            } catch (error) {
                console.error("Error fetching certificates:", error);
                setCertsData([]); // Clear certs data in case of error
                setErrorMessage("Error fetching certificates. Please try again.");
            }
        };

        fetchCerts();
    }, []);

    function handleViewCertificate(cert: DocumentData) {
        return (
            <ViewCertificate
                firstName={cert.nameFirst}
                lastName={cert.nameLast}
                courseName={cert.courseName}
                completionDate={cert.completionDate}
                userEmail={cert.Email}
            />
        );
    }

    return (
        <>
            <Navbar />
            <div>
                {userData ? (
                    <>
                        <div className="text">
                            <h1>Certificates</h1>
                            <h2>Welcome, {userData.firstName}</h2>
                        </div>
                        <div className="main-content">
                            <div className="container">
                                <h2 style={{ textAlign: 'center' }}>Certificates</h2>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Certificate ID</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {certsData.map((cert) => (
                                            <tr key={cert.id}>
                                                <td>{cert.id}</td>
                                                <td>
                                                    <DownloadCertificate
                                                        firstName={cert.nameFirst}
                                                        lastName={cert.nameLast}
                                                        courseName={cert.courseName}
                                                        completionDate={cert.completionDate}
                                                        userEmail={cert.Email}
                                                    />
                                                    <button onClick={() => handleViewCertificate(cert)}>
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text">
                        <h1>Certificates</h1>
                        <h2>{errorMessage || "Please log in to view certificates"}</h2>
                    </div>
                )}
            </div>
        </>
    );
}

export default Certs;