import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';
import "../stylesheets/Register.css";

const Signup = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState({
    email: "",
    password: "",
    username: ""
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const backend_url = "http://cloudProject-load-balancer-1545386799.us-east-1.elb.amazonaws.com/api/users";

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setInputValue((prevInputValue) => ({
      ...prevInputValue,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${backend_url}`,
        {
          email: inputValue.email,
          password: inputValue.password,
          username: inputValue.username
        },
        { withCredentials: true }
      );
      
      const { status, data } = response;
      if (status === 201) {
        setSuccessMessage("SignUp successfully");
        setTimeout(() => {
          navigate("/login");
        }, 1000);
      } else {
        setErrorMessage(data.message);
      }
    } catch (error) {
      console.error("Error during signup:", error);
      setErrorMessage(error.response.data.message || "An error occurred");
    }
    setInputValue({
      email: "",
      password: "",
      username: "",
    });
  };

  return (
    <div className="welcome-container">
      <h2 className="welcome-back">Welcome</h2>
      <div className="signup-container">
        <h2>Create Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <div className="h4 pb-2 mb-4 text-white border-bottom border-white">
              <label htmlFor="email">Email</label>
              <br/>
              <input
                type="email"
                name="email"
                value={inputValue.email}
                placeholder="Enter your email"
                onChange={handleOnChange}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="h4 pb-2 mb-4 text-white border-bottom border-white">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                name="username"
                value={inputValue.username}
                placeholder="Enter your username"
                onChange={handleOnChange}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="h4 pb-2 mb-4 text-white border-bottom border-white">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                name="password"
                value={inputValue.password}
                placeholder="Enter your password"
                onChange={handleOnChange}
              />
            </div>
          </div>
          <button type="submit">Submit</button>
          <span className="messages">
            {errorMessage} {successMessage}
          </span>
          <span className="login-link">
            Already have an account? <Link to={"/login"}>Login</Link>
          </span>
        </form>
        <p className="text-white"></p>
        <h6 className="about"> 
        ECS Travel Review, founded in 2024, is a reliable support partner for
          people who intend to travel to other countries. Committed to excellence, ECS provides
          reviews about famous places like resturants, cafes and tourists attractoin .</h6>
      </div>
    </div>
  );
};

export default Signup;