import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Login from "./pages/Login";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AddReview from "./pages/AddReview";
import Register from "./pages/Register";

import Profile from "./pages/profile"; // Import the Profile component


function App() {
  return (
    <>
        <Routes>
      
        {/* <Route path="/user" element={<UserProfile />} /> */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/add" element={<AddReview />} />
        <Route path="/profile" element={<Profile />} /> 
        <Route path="/" element={<Login />} />
        <Route path="/health" element={<Login />} />



        </Routes>
    </>
  );
}

export default App;