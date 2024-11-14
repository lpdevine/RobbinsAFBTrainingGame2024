import "../components/components.css";
import GetBuildContext from "../components/UnityGame";
import { Unity } from "react-unity-webgl";
import { useCallback, useEffect, useState } from "react";
import { GetUserData, SetDoc } from "../firebase";
import { Timestamp, doc, setDoc } from "firebase/firestore";
import DownloadCertificate from "../components/DownloadCertificate";
import SendEmail from "../components/EmailJS";
import { auth, database } from "../firebase"; // Ensure auth and database are imported
import { ReactUnityEventParameter } from "react-unity-webgl/distribution/types/react-unity-event-parameters";

const maxAttempts = 3;

function NoFearAct() {
    const buildContext = GetBuildContext("nofearact");

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

    function handleSceneLoaded() {
        LoadUnityProgress();
    }

    async function LoadUnityProgress() {
        const user = auth.currentUser;
        if (!user || !user.email) {
            console.error("No authenticated user or email found.");
            return;
        }

        const data = await GetUserData(user.uid);

        if (data.nofearActsCompleted) buildContext.sendMessage("Acts", "OnModuleCompleted");
        if (data.nofearDartsCompleted) buildContext.sendMessage("Darts", "OnModuleCompleted");
        if (data.nofearDoctorCompleted) buildContext.sendMessage("Doctor", "OnModuleCompleted");
        buildContext.sendMessage(
            "Jeopardy",
            "SetAttempts",
            data.nofearAttemptsRemaining == null ? maxAttempts : data.nofearAttemptsRemaining
        );
    }

    useEffect(() => {
        buildContext.addEventListener("SceneLoaded", handleSceneLoaded);
        return () => {
            buildContext.removeEventListener("SceneLoaded", handleSceneLoaded);
        };
    }, [buildContext, handleSceneLoaded]);

    const handleModuleCompleted = useCallback((moduleName: ReactUnityEventParameter) => {
        console.log("Module Completed: " + moduleName);
        UpdateModuleCompleted(moduleName);
    }, []);

    async function UpdateModuleCompleted(moduleName: ReactUnityEventParameter) {
        const user = auth.currentUser;
        if (!user || !user.email) {
            console.error("No authenticated user or email found.");
            return;
        }

        const data = await GetUserData(user.uid);

        const moduleNameString = moduleName?.toString();
        if (moduleNameString !== undefined) {
            data[`nofear${moduleNameString}Completed`] = true;

            const modulesCompleted =
                (data.nofearActsCompleted ? 1 : 0) +
                (data.nofearDartsCompleted ? 1 : 0) +
                (data.nofearDoctorCompleted ? 1 : 0);
            data.nofearProgress = (modulesCompleted / 3) * 100;
        }

        await SetDoc(data, `users/${user.uid}`);
    }

    useEffect(() => {
        buildContext.addEventListener("ModuleCompleted", handleModuleCompleted);
        return () => {
            buildContext.removeEventListener("ModuleCompleted", handleModuleCompleted);
        };
    }, [buildContext, handleModuleCompleted]);

    const handleJeopardyPassed = useCallback(() => {
        console.log("JeopardyPassed");
        UpdateJeopardyPassed();
    }, []);

    async function UpdateJeopardyPassed() {
        const user = auth.currentUser;
        if (!user || !user.email) {
            console.error("No authenticated user or email found.");
            return;
        }

        const data = await GetUserData(user.uid);

        data.nofearActsCompleted = false;
        data.nofearDartsCompleted = false;
        data.nofearDoctorCompleted = false;
        data.nofearProgress = 0;
        data.nofearAttemptsRemaining = maxAttempts;
        data.nofearCompletionTime = Timestamp.now();

        setCompleted(true);
        SendEmail(user.email, "No Fear Act");

        // Save updated user data in Firestore
        await SetDoc(data, `users/${user.uid}`);

        // Define certificate data
        const certData = {
            nameFirst: data.firstName,
            nameLast: data.lastName,
            courseName: "No Fear Act",
            completionDate: Timestamp.now(),
            Email: user.email
        };

        try {
            // Use courseName as the document ID in the certs sub-collection
            const certDocRef = doc(database, `users/${user.uid}/certs`, certData.courseName);
            await setDoc(certDocRef, certData);
            console.log("Certificate added to the user's certs collection with courseName as certID");
        } catch (error) {
            console.error("Error adding certificate to certs collection:", error);
        }
    }

    useEffect(() => {
        buildContext.addEventListener("JeopardyPassed", handleJeopardyPassed);
        return () => {
            buildContext.removeEventListener("JeopardyPassed", handleJeopardyPassed);
        };
    }, [buildContext, handleJeopardyPassed]);

    const handleJeopardyFailed = useCallback((attemptsRemaining: ReactUnityEventParameter) => {
        console.log("JeopardyFailed");
        UpdateJeopardyFailed(attemptsRemaining);
    }, []);

    async function UpdateJeopardyFailed(attemptsRemaining: ReactUnityEventParameter) {
        const user = auth.currentUser;
        if (!user || !user.email) {
            console.error("No authenticated user or email found.");
            return;
        }

        const data = await GetUserData(user.uid);

        const attemptsRemainingNum = Number(attemptsRemaining);
        if (isNaN(attemptsRemainingNum)) throw new Error("Attempts Remaining is Not a Number!");

        if (attemptsRemainingNum <= 0) {
            data.nofearActsCompleted = false;
            data.nofearDartsCompleted = false;
            data.nofearDoctorCompleted = false;
            data.nofearProgress = 0;
            data.nofearAttemptsRemaining = maxAttempts;
        } else {
            data.nofearAttemptsRemaining = attemptsRemainingNum;
        }

        await SetDoc(data, `users/${user.uid}`);
    }

    useEffect(() => {
        buildContext.addEventListener("JeopardyFailed", handleJeopardyFailed);
        return () => {
            buildContext.removeEventListener("JeopardyFailed", handleJeopardyFailed);
        };
    }, [buildContext, handleJeopardyFailed]);

    return (
        <>
            {!completed ? (
                <Unity unityProvider={buildContext.unityProvider} className="UnityGame" />
            ) : (
                <DownloadCertificate
                    firstName={userData.firstName}
                    lastName={userData.lastName}
                    courseName={"No Fear Act"}
                    completionDate={Timestamp.now()}
                    userEmail={email || ""}
                />
            )}
        </>
    );
}

export default NoFearAct;
