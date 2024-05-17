import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import UserNavbBar from '../components/UserNavbBar';
import "../stylesheets/profile.css";

const profile = () => {
  const [formData, setFormData] = useState({
    country: "",
    city: "",
    rating: "",
    comment: ""
  });
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingReviewId, setEditingReviewId] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const email = localStorage.getItem("email");
        const response = await axios.get(`http://cloudProject-load-balancer-1545386799.us-east-1.elb.amazonaws.com/api/reviews/${email}`);
        setReviews(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching reviews:', error.message);
      }
    };
    fetchReviews();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const updateReview = async (reviewId) => {
    try {
      const response = await axios.put(`http://cloudProject-load-balancer-1545386799.us-east-1.elb.amazonaws.com/api/reviews/${reviewId}`, formData);
      setReviews(reviews.map(review => review.reviewId === reviewId ? response.data : review));
      setEditingReviewId(null); // Clear editing review id after update
      console.log('Review updated successfully');
    } catch (error) {
      console.error('Error updating review:', error.message);
    }
  };

  const deleteReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        const response = await axios.delete(`http://cloudProject-load-balancer-1545386799.us-east-1.elb.amazonaws.com/api/reviews/${reviewId}`);
        if (response.status === 200) {
          setReviews(reviews.filter(review => review.reviewId !== reviewId));
          console.log('Review deleted successfully');
        }
      } catch (error) {
        console.error('Error deleting review:', error.message);
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-container">
      <div className="navbar-top-right">
        <UserNavbBar />
      </div>
      <h1 className="profile-title">Profile Page</h1>
      {reviews.length === 0 ? (
        <p>No reviews found. <Link to="/add">Add Review</Link></p>
      ) : (
        <ul className="card-list">
          {reviews.map(review => (
            <li key={review.reviewId} className={editingReviewId === review.reviewId ? 'editing' : ''}>
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">{review.country}, {review.city}</h5>
                  <h6 className="card-subtitle mb-2 text-muted">Rating: {review.rating}</h6>
                  <p className="card-text">{review.comment}</p>
                  <img
                    src={`https://d2k2av9k6yzgj2.cloudfront.net/${review.image}`}
                    alt="Review"
                    className="card-img-top review-image"
                  />
                  <img
                    src="src/assets/bin.png"  // Path to your delete icon image
                    alt="Delete Review"
                    className="delete-icon"
                    onClick={() => deleteReview(review.reviewId)}
                  />
                </div>
                <div className="update-form">
                  {editingReviewId === review.reviewId && (
                    <>
                      <h3>Update Review</h3>
                      <input
                        type="text"
                        name="country"
                        placeholder="Update country"
                        value={formData.country}
                        onChange={handleInputChange}
                      />
                      <input
                        type="text"
                        name="city"
                        placeholder="Update city"
                        value={formData.city}
                        onChange={handleInputChange}
                      />
                      <input
                        type="text"
                        name="rating"
                        placeholder="Update rating"
                        value={formData.rating}
                        onChange={handleInputChange}
                      />
                      
                      <input
                        type="text"
                        name="comment"
                        placeholder="Update comment"
                        value={formData.comment}
                        onChange={handleInputChange}
                        style={{ fontSize: '16px', height: '80px' }} // Adjust font size and height
                      />
                      <button className="update-button" onClick={() => updateReview(review.reviewId)}>Update Review</button>
                    </>
                  )}
                </div>
              </div>
              {!editingReviewId && (
                <button className="edit-button" onClick={() => setEditingReviewId(review.reviewId)}>Edit Review</button>
                
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default profile;
