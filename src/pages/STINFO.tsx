import "../components/components.css";
import GetBuildContext from "../components/UnityGame";
import { Unity } from "react-unity-webgl";
import { useCallback, useEffect, useState } from "react";
import { GetActiveUserEmail, GetUserData, SetDoc } from "../firebase";
import { Timestamp } from "firebase/firestore";
import DownloadCertificate from "../components/DownloadCertificate";
import SendEmail from "../components/EmailJS";

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
