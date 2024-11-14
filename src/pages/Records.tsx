import "../components/components.css";
import GetBuildContext from "../components/UnityGame";
import { Unity } from "react-unity-webgl";
import { useCallback, useEffect, useState } from "react";
import { GetActiveUserEmail, GetUserData, SetDoc } from "../firebase";
import { Timestamp, doc, setDoc } from "firebase/firestore";
import DownloadCertificate from "../components/DownloadCertificate";
import SendEmail from "../components/EmailJS";
import { database } from "../firebase"; // Ensure database is imported

function Records() {
    const buildContext = GetBuildContext("records");

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
        const data = await GetUserData(email); // Ensures document is created if missing

        setEmail(email);
        setUserData(data);
    }

    // Handling and Subscription to MemoryPassed UnityWebGL Event
    const handleMemoryPassed = useCallback(() => {
        console.log("Memory Passed!");
        UpdateMemoryPassed();
    }, []);

    async function UpdateMemoryPassed() {
        const email = GetActiveUserEmail();
        const data = await GetUserData(email);

        // Update progress and completion time
        data["recordsProgress"] = 100;
        data["recordsCompletionTime"] = Timestamp.now();

        // Mark completion and send certificate email
        setCompleted(true);
        SendEmail(email, "Records Management");

        // Save updated user data in Firestore
        await SetDoc(data, `users/${email}`);

        // Add a new certificate document in the `certs` sub-collection
        const certData = {
            nameFirst: data.firstName,
            nameLast: data.lastName,
            courseName: "Records Management",
            completionDate: Timestamp.now(),
            Email: email,
        };

        try {
            const certDocRef = doc(database, `users/${email}/certs`, certData.courseName);
            await setDoc(certDocRef, certData);
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
    }, [buildContext, handleMemoryPassed]);

    return (
        <>
            {!completed ? (
                <Unity unityProvider={buildContext.unityProvider} className="UnityGame" />
            ) : (
                <DownloadCertificate
                    firstName={userData.firstName}
                    lastName={userData.lastName}
                    courseName={"Records Management"}
                    completionDate={Timestamp.now()}
                    userEmail={email}
                />
            )}
        </>
    );
}

export default Records;
