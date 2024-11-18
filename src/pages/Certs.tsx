import Navbar from "../components/Navbar";
import { useState, useEffect } from "react";
import { auth, database } from "../firebase";
import { collection, getDocs, onSnapshot, DocumentData, doc, getDoc } from "firebase/firestore";
import "../components/certs.css";
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
    const defaultUserData: UserData = {
        firstName: "",
        lastName: "",
        squadron: "",
        noFearProgress: 0,
        recordsProgress: 0,
        stinfoProgress: 0,
        nofearCompletionTime: null,
        recordsCompletionTime: null,
        stinfoCompletionTime: null,
        admin: false,
    };
    const [userData, setUserData] = useState<UserData>(defaultUserData);
    const [allUserData, setAllUserData] = useState<UserData[] | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [certsData, setCertsData] = useState<DocumentData[]>([]);
    const [selectedCert, setSelectedCert] = useState<DocumentData | null>(null);
    const [showModal, setShowModal] = useState(false);

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
        fetchData();
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
                const userData = await getUserData(uid);
    
                if (userData?.admin) {
                    // Fetch all users' certificates if admin
                    const usersCollectionRef = collection(database, "users");
                    const usersSnapshot = await getDocs(usersCollectionRef);
                    let formattedData = [];
    
                    for (const userDoc of usersSnapshot.docs) {
                        const userInfo = userDoc.data();
    
                        // Fetch certs for each user
                        const certsCollectionRef = collection(database, "users", userDoc.id, "certs");
                        const certsSnapshot = await getDocs(certsCollectionRef);
    
                        const certsMap = certsSnapshot.docs.reduce((acc, doc) => {
                            const certData = doc.data();
                            acc[certData.courseName] = {
                                id: doc.id,
                                ...certData,
                            };
                            return acc;
                        }, {});
    
                        formattedData.push({
                            userId: userDoc.id,
                            userName: `${userInfo.lastName}, ${userInfo.firstName}`,
                            userFirstName: `${userInfo.firstName}`, 
                            userLastName: `${userInfo.lastName}`, 
                            userSquadron: `${userInfo.squadron}`,
                            noFearProgress: `${userInfo.nofearProgress}`,
                            recordsProgress: `${userInfo.recordsProgress}`,
                            stinfoProgress: `${userInfo.stinfoProgress}`,
                            noFearCert: certsMap['No Fear Act'] || null,
                            recordsCert: certsMap['Records Management'] || null,
                            stinfoCert: certsMap['STINFO'] || null,
                        });
                    }
                    setCertsData(formattedData);
                } else {
                    // For regular users, fetch only their own certificates
                    const certsCollectionRef = collection(database, "users", uid, "certs");
                    const certsSnapshot = await getDocs(certsCollectionRef);
    
                    const certsMap = certsSnapshot.docs.reduce((acc, doc) => {
                        const certData = doc.data();
                        acc[certData.courseName] = {
                            id: doc.id,
                            ...certData,
                        };
                        return acc;
                    }, {});
    
                    setCertsData([{
                        userId: uid,
                        userName: `${userData.lastName}, ${userData.firstName}`,
                        userFirstName: `${userData.firstName}`, 
                        userLastName: `${userData.lastName}`, 
                        userSquadron: `${userData.squadron}`,
                        noFearProgress: `${userData.nofearProgress}`,
                        recordsProgress: `${userData.recordsProgress}`,
                        stinfoProgress: `${userData.stinfoProgress}`,
                        noFearCert: certsMap['No Fear Act'] || null,
                        recordsCert: certsMap['Records Management'] || null,
                        stinfoCert: certsMap['STINFO'] || null,
                    }]);
                }
            } catch (error) {
                console.error("Error fetching certificates:", error);
                setCertsData([]);
                setErrorMessage("Error fetching certificates. Please try again.");
            }
        };
        fetchCerts();
    }, []);

    function handleViewCertificate(cert: DocumentData) {
        setSelectedCert(cert);
        setShowModal(true);
    }

    function closeModal() {
        setShowModal(false);
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
                        <div>
                        {userData?.admin ? (
                            <div className="certs-main-content">
                                <div className="certs-container">
                                    <h2 className="table-name">All Employees' Certificates</h2>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th className="th">Employee Name</th>
                                                <th className="th">Squadron</th>
                                                <th className="th">No Fear Act</th>
                                                <th className="th">Records Management</th>
                                                <th className="th">STINFO</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {certsData.map((user) => (
                                                <tr key={user.userId}>
                                                    <td className="td">{user.userName}</td>
                                                    <td className="td">{user.userSquadron}</td>
                                                    <td className="td">
                                                        {user.nofearProgress == 100 ? (
                                                            <>
                                                                <DownloadCertificate
                                                                    firstName={user.userFirstName}
                                                                    lastName={user.userLastName}
                                                                    courseName={user.noFearCert.courseName}
                                                                    completionDate={user.noFearCert.completionDate}
                                                                    userEmail={user.noFearCert.Email}
                                                                />
                                                                <button onClick={() => handleViewCertificate(user.noFearCert)}>
                                                                    View
                                                                </button>
                                                            </>
                                                        ) : (
                                                            "Not Completed"
                                                        )}
                                                    </td>
                                                    <td className="td">
                                                        {user.recordsProgress == 100 ? (
                                                            <>
                                                                <DownloadCertificate
                                                                    firstName={user.userFirstName}
                                                                    lastName={user.userLastName}
                                                                    courseName={user.recordsCert.courseName}
                                                                    completionDate={user.recordsCert.completionDate}
                                                                    userEmail={user.recordsCert.Email}
                                                                />
                                                                <button onClick={() => handleViewCertificate(user.recordsCert)}>
                                                                    View
                                                                </button>
                                                            </>
                                                        ) : (
                                                            "Not Completed"
                                                        )}
                                                    </td>
                                                    <td className="td">
                                                        {user.stinfoProgress == 100 ? (
                                                            <>
                                                                <DownloadCertificate
                                                                    firstName={user.userFirstName}
                                                                    lastName={user.userLastName}
                                                                    courseName={user.stinfoCert.courseName}
                                                                    completionDate={user.stinfoCert.completionDate}
                                                                    userEmail={user.stinfoCert.Email}
                                                                />
                                                                <button onClick={() => handleViewCertificate(user.stinfoCert)}>
                                                                    View
                                                                </button>
                                                            </>
                                                        ) : (
                                                            "Not Completed"
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            // Regular user view
                            <div className="certs-main-content">
                                <div className="certs-container">
                                    <h2 className="table-name">My Certificates</h2>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th className="th">Employee Name</th>
                                                <th className="th">Squadron</th>
                                                <th className="th">No Fear Act</th>
                                                <th className="th">Records Management</th>
                                                <th className="th">STINFO</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {certsData.map((user) => (
                                                <tr key={user.userId}>
                                                    <td className="td">{user.userName}</td>
                                                    <td className="td">{user.userSquadron}</td>
                                                    <td className="td">
                                                        {user.noFearCert ? (
                                                            <>
                                                                <DownloadCertificate
                                                                    firstName={user.userFirstName}
                                                                    lastName={user.userLastName}
                                                                    courseName={user.noFearCert.courseName}
                                                                    completionDate={user.noFearCert.completionDate}
                                                                    userEmail={user.noFearCert.Email}
                                                                />
                                                                <button onClick={() => handleViewCertificate(user.noFearCert)}>
                                                                    View
                                                                </button>
                                                            </>
                                                        ) : (
                                                            "Not Completed"
                                                        )}
                                                    </td>
                                                    <td className="td">
                                                        {user.recordsCert ? (
                                                            <>
                                                                <DownloadCertificate
                                                                    firstName={user.userFirstName}
                                                                    lastName={user.userLastName}
                                                                    courseName={user.recordsCert.courseName}
                                                                    completionDate={user.recordsCert.completionDate}
                                                                    userEmail={user.recordsCert.Email}
                                                                />
                                                                <button onClick={() => handleViewCertificate(user.recordsCert)}>
                                                                    View
                                                                </button>
                                                            </>
                                                        ) : (
                                                            "Not Completed"
                                                        )}
                                                    </td>
                                                    <td className="td">
                                                        {user.stinfoCert ? (
                                                            <>
                                                                <DownloadCertificate
                                                                    firstName={user.userFirstName}
                                                                    lastName={user.userLastName}
                                                                    courseName={user.stinfoCert.courseName}
                                                                    completionDate={user.stinfoCert.completionDate}
                                                                    userEmail={user.stinfoCert.Email}
                                                                />
                                                                <button onClick={() => handleViewCertificate(user.stinfoCert)}>
                                                                    View
                                                                </button>
                                                            </>
                                                        ) : (
                                                            "Not Completed"
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                        </div>
                    </>
                ) : (
                    <div className="text">
                        <h1>Certificates</h1>
                        <h2>{errorMessage || "Please log in to view certificates"}</h2>
                    </div>
                )}
            </div>
            {showModal && selectedCert && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="close-button" onClick={closeModal}>
                            &times;
                        </button>
                        <ViewCertificate
                            firstName={selectedCert.nameFirst}
                            lastName={selectedCert.nameLast}
                            courseName={selectedCert.courseName}
                            completionDate={selectedCert.completionDate}
                            userEmail={selectedCert.Email}
                        />
                    </div>
                </div>
            )}
        </>
    );
}
export default Certs;