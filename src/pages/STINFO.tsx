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

    const handleMemoryPassed = useCallback(() => {
        console.log("Memory Passed!");
        UpdateMemoryPassed();
    }, []);

    async function UpdateMemoryPassed() {
        const email = GetActiveUserEmail();
        const data = await GetUserData(email);
        data["recordsProgress"] = 100;
        data["recordsCompletionTime"] = Timestamp.now();

        setCompleted(true);
        SendEmail(email, "STINFO");
        SetDoc(data, "users/" + email);
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
                <div className="unity-wrapper"> {/* Centering wrapper */}
                    <Unity unityProvider={buildContext.unityProvider} className="UnityGame" />
                </div>
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
