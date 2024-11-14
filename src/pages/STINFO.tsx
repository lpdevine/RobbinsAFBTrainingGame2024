import "../components/components.css";
import GetBuildContext from "../components/UnityGame";
import { Unity } from "react-unity-webgl";
import { useCallback, useEffect, useState } from "react";
import { GetActiveUserEmail, GetUserData, SetDoc } from "../firebase";
import { Timestamp, doc, setDoc } from "firebase/firestore";
import DownloadCertificate from "../components/DownloadCertificate";
import SendEmail from "../components/EmailJS";
import { auth, database } from "../firebase"; // Ensure auth and database are imported

function STINFO() {
    const buildContext = GetBuildContext("STINFO");
    const [completed, setCompleted] = useState(false);
    const [email, setEmail] = useState<string | null>(null); // Allow email to be null
    const [userData, setUserData] = useState<any>({});
    const [initDone, setInitDone] = useState(false);

    if (!initDone) {
        Init();
    }

    async function Init() {
        setInitDone(true);

        const user = auth.currentUser;
        if (!user || !user.email) {
            console.error("No authenticated user or email found.");
            return;
        }
        
        const data = await GetUserData(user.uid);

        setEmail(user.email);
        setUserData(data);
    }

    // Handling and Subscription to External Jeopardy Passed UnityWebGL Events
    const handleMemoryPassed = useCallback(() => {
        console.log("Memory Passed!");
        UpdateMemoryPassed();
    }, []);

    async function UpdateMemoryPassed() {
        const user = auth.currentUser;
        if (!user || !user.email) {
            console.error("No authenticated user or email found.");
            return;
        }
        
        const uid = user.uid;
        const data = await GetUserData(uid);

        // Update progress and completion time for STINFO
        data["stinfoProgress"] = 100;
        data["stinfoCompletionTime"] = Timestamp.now();

        setCompleted(true);
        SendEmail(user.email, "STINFO");

        // Save updated user data in Firestore
        SetDoc(data, `users/${uid}`);

        // Define certificate data and use courseName as certID
        const certData = {
            nameFirst: data.firstName,
            nameLast: data.lastName,
            courseName: "STINFO",
            completionDate: Timestamp.now(),
            Email: user.email
        };

        try {
            // Use courseName as the document ID in the certs sub-collection
            const certDocRef = doc(database, `users/${uid}/certs`, certData.courseName);
            await setDoc(certDocRef, certData); // Set the document in Firestore with courseName as ID
            console.log("Certificate added to the user's certs collection with courseName as certID");
        } catch (error) {
            console.error("Error adding certificate to certs collection:", error);
        }
    }

    useEffect(() => {
        buildContext.addEventListener("MemoryPassed", handleMemoryPassed);
        return () => {
            buildContext.removeEventListener("MemoryPassed", handleMemoryPassed);
        };
    }, [buildContext.addEventListener, buildContext.removeEventListener, handleMemoryPassed]);

    return (
        <>
            {!completed ? (
                <Unity unityProvider={buildContext.unityProvider} className="UnityGame" />
            ) : (
                <DownloadCertificate
                    firstName={userData.firstName}
                    lastName={userData.lastName}
                    courseName={"STINFO"}
                    completionDate={Timestamp.now()}
                    userEmail={email || ""} // Provide fallback empty string for email
                />
            )}
        </>
    );
}

export default STINFO;
