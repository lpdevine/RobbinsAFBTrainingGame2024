import Navbar from "../components/Navbar";
import { useState, useEffect } from "react";
import { auth, database } from "../firebase.ts";
import { collection, getDocs, DocumentData } from "firebase/firestore";
import { getUserData } from "../components/firestoreUtils.tsx";
import "../components/certs.css"
import "../components/dashboard.css"
import { Timestamp } from "firebase/firestore";
import DownloadCertificate from "../components/DownloadCertificate.tsx";
import ViewCertificate from "../components/ViewCertificate.tsx";

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

function Certs() {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [email, setEmail] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState("")
    const [certsData, setCertsData] = useState<DocumentData[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const userDataString = localStorage.getItem("userData");
            if (userDataString) {
                const userEmail = JSON.parse(userDataString);
                setEmail(userEmail);
                const userData = await getUserData(userEmail);
                setUserData(userData);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (email) {
            const fetchCerts = async () => {
                try {
                    const certPath = `users/${email}/certificates`;
                    const certsCollectionRef = collection(database, certPath);
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
        }
    }, [email]);


    async function handleViewCertificate(cert: DocumentData) {
        <ViewCertificate
            firstName={cert.firstName}
            lastName={cert.lastName}
            courseName={cert.courseName}
            completionDate={cert.completionDate}
            userEmail={cert.user}
        />

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
                                                        firstName={cert.firstName}
                                                        lastName={cert.lastName}
                                                        courseName={cert.courseName}
                                                        completionDate={cert.completionDate}
                                                        userEmail={cert.userEmail}
                                                    />
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
                        <h2>Please log in to view certificates</h2>
                    </div>
                )}
            </div>
        </>
    )
}
export default Certs;