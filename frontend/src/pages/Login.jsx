import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../stylesheets/login.css";
import 'bootstrap/dist/css/bootstrap.min.css';

const Login = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState({ email: "", password: "" });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setInputValue((prevInput) => ({
      ...prevInput,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://cloudProject-load-balancer-1545386799.us-east-1.elb.amazonaws.com/api/login', inputValue);
      const { status, data } = response;
      if (status === 200) {
        setSuccessMessage("Login successful!");
        
        // Assuming data contains user info such as email, name, etc.
        // Storing all user data in localStorage
        
        console.log(":", data );
          localStorage.setItem("email", data.email);
          

        navigate(`/add`); // Redirect to dashboard after successful login
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 404) {
          setErrorMessage("User not found");
        } else if (error.response.status === 401) {
          setErrorMessage("Invalid credentials");
        } else {
          setErrorMessage(`Login failed: ${error.message}`);
        }
      } else {
        setErrorMessage(`Login failed: ${error.message}`);
      }
    }
  };

  return (
    <div className="welcome-container">
      <h2 className="welcome-back">Welcome Back</h2>
      <div className="form_container">
        <h2>Login To Your Account</h2>
        <form onSubmit={handleSubmit}>
          {/* Email input */}
          <div className="h4 pb-2 mb-4 text-white border-bottom border-white">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              value={inputValue.email}
              placeholder="Enter your email"
              onChange={handleOnChange}
              autoComplete="username" // Enhance autofill
            />
          </div>

          {/* Password input */}
          <div className="h4 pb-2 mb-4 text-white border-bottom border-white">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              value={inputValue.password}
              placeholder="Enter your password"
              onChange={handleOnChange}
              autoComplete="current-password" // Enhance autofill
            />
          </div>

          {/* Submit button */}
          <button type="submit">Submit</button>

          {/* Message display */}
          <p>{successMessage}</p>
          <p>{errorMessage}</p>

          {/* Link to sign up */}
          <p>
            <br />
            Don't have an account? <Link to="/register">Sign up</Link>
            <br />
          </p>
        </form>
      
        <p className="text-black">About Us</p>
        <h6 className="about">
          ECS Travel Review, founded in 2024, is a reliable support partner for
          people who intend to travel to other countries. Committed to excellence, ECS provides
          reviews about famous places like resturants, cafes and tourists attractoin .
        </h6>
      </div>
    </div>
  );
};

export default Login;
