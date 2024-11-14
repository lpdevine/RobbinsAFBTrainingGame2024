// Signin.tsx

import { doc, getDoc } from "firebase/firestore";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import EmailPasswordForm from "../components/EmailPasswordForm";
import Navbar from "../components/Navbar";
import "../components/components.css";
import ResizeableBox from "../components/ResizeableBox";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, database } from "../firebase";

function Signin() {
  const [signinData, setSigninData] = useState({ email: "", password: "" });
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  // Handle input changes
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setSigninData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }

  // Handle form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setShowError(false);
    setErrorMessage("");

    try {
      // Sign in the user
      const userCredential = await signInWithEmailAndPassword(
        auth,
        signinData.email,
        signinData.password
      );
      const user = userCredential.user;

      // Use UID to retrieve the user's document from Firestore
      const userDocRef = doc(database, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        // User data found, save it to local storage
        const userData = userDoc.data();
        localStorage.setItem("userData", JSON.stringify(userData));
        console.log("User data:", userData);

        // Navigate to the dashboard
        navigate("/dashboard");
      } else {
        // No user data found
        console.log("No user data found!");
        setShowError(true);
        setErrorMessage("User data not found. Please contact support.");
      }
    } catch (error: any) {
      console.error("Error during sign-in:", error.code, error.message);
      setShowError(true);
      setErrorMessage("Email or password incorrect!");
      return;
    }
  }

  return (
    <>
      <Navbar />
      <ResizeableBox>
        <div>
          <EmailPasswordForm
            formType="login"
            title="Login"
            errorMessage={errorMessage}
            showError={showError}
            formData={signinData}
            onSubmit={handleSubmit}
            onInputChange={handleChange}
          />
          <Link to="/forgot-password" className="link">
            Forgot Password?
          </Link>
          <hr className="short-hr"></hr>
          <button className="button-with-link">
            <Link to="/signup">Create New Account</Link>
          </button>
        </div>
      </ResizeableBox>
    </>
  );
}

export default Signin;
