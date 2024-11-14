import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import './firebase.ts'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import Signup from './pages/Signup.tsx'
import ResizeableBox from './components/ResizeableBox.tsx'
import Navbar from './components/Navbar.tsx'
import Signin from './pages/Signin.tsx'
import NoFearAct from './pages/NoFearAct.tsx'
import Records from './pages/Records.tsx'
import STINFO from './pages/STINFO.tsx';
import Dashboard from './pages/Dashboard.tsx'
import Profile from './pages/Profile.tsx'
import Certs from './pages/Certs.tsx'
import ForgotPassword from './pages/ForgotPassword.tsx'

// Create router instance
const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/signin" replace />, // Root path redirects to Signin
  },
  {
    path: "/dashboard",
    element: <><Navbar /><Dashboard /></>,
  },
  {
    path: "/signup",
    element: <ResizeableBox><Signup /></ResizeableBox>, // Excludes Navbar on Signup page
  },
  {
    path: "/signin",
    element: <Signin />, // Login page for initial loading
  },
  {
    path: "/stinfo",
    element: <><Navbar /><h1 className="text">STINFO Training</h1><STINFO/></>,
  },
  {
    path: "/nofear",
    element: <><Navbar /><h1 className="text">No Fear Act Training</h1><NoFearAct /></>
  },
  {
    path: "/records",
    element: <><Navbar /><h1 className="text">Records Management Training</h1><Records /></>,
  },
  {
    path: "/management",
    element: <><Navbar /><h1 className="text">Management</h1></>,
  },
  {
    path: "/profile",
    element: <><Navbar /><Profile /></>, // Adds Navbar for Profile page
  },
  {
    path: "/certificates",
    element: <><Navbar /><Certs /></>, // Adds Navbar for Certificates page
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />, // Excludes Navbar on Forgot Password page
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
