// ForgotPassword.tsx

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import "../components/components.css";
import EmailPasswordForm from "../components/EmailPasswordForm";

function ForgotPassword() {
    const [emailData, setEmailData] = useState({ email: "" });
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    // Handle input change for email field
    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const { name, value } = e.target;
        setEmailData(prevState => ({
            ...prevState,
            [name]: value
        }));
    }

    // Handle form submission to send reset email
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setShowError(false);
        setErrorMessage("");

        try {
            // Send password reset email via Firebase Auth
            await sendPasswordResetEmail(auth, emailData.email);
            console.log("Password reset email sent successfully");
            navigate("/signin"); // Navigate back to sign-in page
        } catch (error: any) {
            console.error("Error sending password reset email:", error);
            setErrorMessage("Error sending password reset email: " + error.message);
            setShowError(true);
        }
    }

    return (
        <div className="login-container"> {/* Centered, larger container */}
            <EmailPasswordForm
                formType="forgotpassword"
                title="Forgot Password"
                errorMessage={errorMessage}
                showError={showError}
                formData={emailData}
                onSubmit={handleSubmit}
                onInputChange={handleChange}
            />
            <Link to="/signup" className="link">New Here? Sign Up</Link>
            <br />
            <Link to="/signin" className="link">Back To Sign In</Link>
        </div>
    );
}

export default ForgotPassword;
