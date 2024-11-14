import "../components/components.css";
import GetBuildContext from "../components/UnityGame";
import { Unity } from "react-unity-webgl";
import { useCallback, useEffect, useState } from "react";
import { GetActiveUserEmail, GetUserData, SetDoc } from "../firebase";
import { Timestamp, doc, setDoc } from "firebase/firestore";
import DownloadCertificate from "../components/DownloadCertificate";
import SendEmail from "../components/EmailJS";
import { database } from "../firebase"; // Ensure database is imported

function STINFO() {
    const buildContext = GetBuildContext("STINFO");
    const [completed, setCompleted] = useState(false);
    const [email, setEmail] = useState("");
    const [userData, setUserData] = useState<any>({});
    const [initDone, setInitDone] = useState(false);

    if (!initDone) {
        Init();
    }

    async function Init() {
        setInitDone(true);

        const email = await GetActiveUserEmail();
        const data = await GetUserData(email);

        setEmail(email);
        setUserData(data);
    }

    // Handling and Subscription to External Jeopardy Passed UnityWebGL Events
    const handleMemoryPassed = useCallback(() => {
        console.log("Memory Passed!");
        UpdateMemoryPassed();
    }, []);

    async function UpdateMemoryPassed() {
        const email = GetActiveUserEmail();
        const data = await GetUserData(email);

        // Update progress and completion time for STINFO
        data["stinfoProgress"] = 100;
        data["stinfoCompletionTime"] = Timestamp.now();

        setCompleted(true);
        SendEmail(email, "STINFO");

        // Save updated user data in Firestore
        SetDoc(data, `users/${email}`);

        // Define certificate data and use courseName as certID
        const certData = {
            nameFirst: data.firstName,
            nameLast: data.lastName,
            courseName: "STINFO",
            completionDate: Timestamp.now(),
            Email: email
        };

        try {
            // Use courseName as the document ID in the certs sub-collection
            const certDocRef = doc(database, `users/${email}/certs`, certData.courseName);
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
                    userEmail={email}
                />
            )}
        </>
    );
}

export default STINFO;
