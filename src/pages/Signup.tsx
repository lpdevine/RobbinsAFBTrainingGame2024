// Signup.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  UserCredential,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, database } from '../firebase'; // Adjust the import paths as needed
import EmailPasswordForm from '../components/EmailPasswordForm'; // Adjust the import path

interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  squadron: string;
}

function Signup() {
  const [formData, setFormData] = useState<SignUpFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    squadron: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const navigate = useNavigate();

  // Handle input changes
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }

  // Handle form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage('');
    setShowError(false);

    const { email, password, confirmPassword, firstName, lastName, squadron } = formData;

    // Validate form inputs
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      setShowError(true);
      return;
    }

    if (!email || !password || !firstName || !lastName || !squadron) {
      setErrorMessage('Please fill in all required fields.');
      setShowError(true);
      return;
    }

    try {
      // Create user with Firebase Authentication
      const userCredential: UserCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Optionally update the user's display name
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`,
      });

      // Prepare user data according to your schema
      const userData = {
        firstName,
        lastName,
        email,
        squadron,
        admin: false, // Set default admin status
        nofearCompletionTime: null,
        recordsCompletionTime: null,
        stinfoCompletionTime: null,
        nofearProgress: 0,
        recordsProgress: 0,
        stinfoProgress: 0,
      };

      // Store user data in Firestore under 'users' collection with UID as the document ID
      const userDocRef = doc(database, 'users', user.uid);
      await setDoc(userDocRef, userData);

      // Navigate to the dashboard or desired page
      navigate('/dashboard');
    } catch (error: any) {
      // Handle Errors here
      console.error('Error during sign-up:', error.code, error.message);
      setShowError(true);

      // Provide user-friendly error messages
      if (error.code === 'auth/email-already-in-use') {
        setErrorMessage('This email is already in use.');
      } else if (error.code === 'auth/invalid-email') {
        setErrorMessage('Invalid email address.');
      } else if (error.code === 'auth/weak-password') {
        setErrorMessage('Password is too weak. It should be at least 6 characters.');
      } else {
        setErrorMessage('An error occurred during sign-up. Please try again.');
      }
    }
  }

  return (
    <div className="signup-container">
      <EmailPasswordForm
        formType="signup"
        title="Sign Up"
        showError={showError}
        errorMessage={errorMessage}
        formData={formData}
        onSubmit={handleSubmit}
        onInputChange={handleChange}
      />
      <p>
        Already have an account? <a href="/signin">Sign In</a>
      </p>
    </div>
  );
}

export default Signup;
