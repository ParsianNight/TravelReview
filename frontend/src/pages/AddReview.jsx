import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../stylesheets/addReview.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import UserNavbBar from '../components/UserNavbBar';

const AddReview = () => {
  const [formData, setFormData] = useState({
    country: "",
    city: "",
    rating: "",
    comment: "",
    email: "", // Default value is an empty string
    image: null,
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [reviews, setReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [blurBackground, setBlurBackground] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(""); // State to store selected country for filtering
  const [filteredReviews, setFilteredReviews] = useState([]); // State to store filtered reviews
  const [containerHeight, setContainerHeight] = useState(0); // State to manage container height

  // Fetch email from local storage after component mounts  
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get("http://cloudProject-load-balancer-1545386799.us-east-1.elb.amazonaws.com/api/reviews");
        setReviews(response.data);
      } catch (error) {
        console.error('Error fetching reviews:', error.message);
      }
    };
    fetchReviews();
  }, []);

  useEffect(() => {
    const email = localStorage.getItem("email");
    if (email) {
      setFormData((prevData) => ({
        ...prevData,
        email: email,
      }));
    }
  }, []);

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      image: e.target.files[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataObj = new FormData();
      formDataObj.append("country", formData.country);
      formDataObj.append("city", formData.city);
      formDataObj.append("rating", formData.rating);
      formDataObj.append("comment", formData.comment);
      formDataObj.append("email", formData.email);
      formDataObj.append("image", formData.image);

      // Upload image to CloudFront URL with image name
      const imageName = formData.image.name; // Get the image name
      const imageUrl = `https://d2k2av9k6yzgj2.cloudfront.net/${imageName}`;
      formDataObj.append("imageUrl", imageUrl);

      // Update the URL to include the correct backend port number
      const response = await axios.post("http://cloudProject-load-balancer-1545386799.us-east-1.elb.amazonaws.com/api/review", formDataObj);
      if (response.status === 201) {
        setSuccessMessage("Review added successfully");
        window.location.reload(); // Redirect to AddReview after successful review addition
      }
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage("Failed to add review");
      }
    }
  };

  const toggleForm = () => {
    // Toggle form visibility
    setShowForm(!showForm);
    setBlurBackground(!blurBackground);
    
    // Set container height based on form visibility
    if (!showForm) {
      setContainerHeight(450); // Set height to show the form
    } else {
      setContainerHeight(0); // Set height to hide the form
    }
  };

  const deleteReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        const response = await axios.delete(`http://cloudProject-load-balancer-1545386799.us-east-1.elb.amazonaws.com/api/reviews/${reviewId}`);
        if (response.status === 200) {
          setReviews(reviews.filter(review => review.reviewId !== reviewId));
          alert('Review deleted successfully');
        }
      } catch (error) {
        alert('Failed to delete the review');
        console.error('Error deleting review:', error);
      }
    }
  };

  const countries = [
    "Argentina", "Brazil", "Canada", "China", "Egypt", "France", "Germany", "India", "Indonesia",
    "Iran", "Italy", "Japan", "Mexico", "Nigeria", "Pakistan", "Philippines", "Russia", "Saudi Arabia",
    "South Africa", "South Korea", "Spain", "Turkey", "Ukraine", "United Kingdom", "United States",
    "Vietnam", "Algeria", "Australia", "Bangladesh", "Belgium", "Colombia", "Ethiopia", "Iraq",
    "Kazakhstan", "Malaysia", "Netherlands", "Peru", "Poland", "Singapore", "Sudan", "Sweden",
    "Switzerland", "Tanzania", "Thailand", "Uganda", "Venezuela", "Yemen", "Zambia"
  ];

  const handleCountryChange = (e) => {
    setSelectedCountry(e.target.value);
  };

  useEffect(() => {
    setFilteredReviews(
      reviews.filter((review) => !selectedCountry || review.country === selectedCountry)
    );
  }, [reviews, selectedCountry]);

  return (
    <div>
      <div className="navbar-top-right">
        <UserNavbBar />
      </div>
      
      <button className="add-review-button" onClick={toggleForm}>
        {showForm ? "Cancel" : "Add Review"}
      </button>
      <div className="add-review-container" style={{ height: `${containerHeight}px` }}>
        {showForm && (
          <div className={`form-container ${blurBackground ? 'blur-background' : ''}`}>
            <h2 className="add-review-title">Add Review</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="country">Country:</label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleOnChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="city">City:</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleOnChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="rating">Rating:</label>
                <input
                  type="number"
                  id="rating"
                  name="rating"
                  value={formData.rating}
                  onChange={handleOnChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="comment">Comment:</label>
                <textarea
                  id="comment"
                  name="comment"
                  value={formData.comment}
                  onChange={handleOnChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="image">Image:</label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
              <button type="submit">Submit Review</button>
            </form>
            <p className="success-message">{successMessage}</p>
            <p className="error-message">{errorMessage}</p>
            <p>
              Don't have an account? <Link to="/register">Sign up</Link>
            </p>
          </div>
        )}
      </div>
      <div className="dropdown">
        <select className="dropbtn" onChange={handleCountryChange}>
          <option value="">Select Country</option>
          {countries.map((country, index) => (
            <option key={index} value={country}>
              {country}
            </option>
          ))}
        </select>
      </div>
      <div className="review-posts">
        {/* Conditional rendering block for "No posts found" */}
        {filteredReviews.length === 0 && (
          <div className="no-posts">No Reviews Found!<br/> Try Posting! we would like to know more from you 🫵</div>
        )}
        {filteredReviews.map((review, index) => (
          <div className="card" key={index}>
            <div className="card-body">
              <h5 className="card-title">{review.country}, {review.city}</h5>
              <h6 className="card-subtitle mb-2 text-muted">Rating: {review.rating}</h6>
              <p className="card-text">{review.comment}</p>
              <img
                src={`https://d2k2av9k6yzgj2.cloudfront.net/${review.image}`}
                alt="Review"
                className="card-img-top review-image"
              />
              {/* <img
                src="src/assets/bin.png"  // Path to your delete icon image
                alt="Delete Review"
                className="delete-icon"
                onClick={() => deleteReview(review.reviewId)}
                style={{ cursor: 'pointer', color: 'red' }}
              /> */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddReview;
