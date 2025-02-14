
 import React, { useState, useEffect } from 'react';
 import { useNavigate } from 'react-router-dom';
 import axios from 'axios';
 
 const Home = () => {
   const navigate = useNavigate();
   const [userData, setUserData] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');
 

   const handleSocialConnection = async (platform) => {
    try {
      // Add logic to handle social network connection
      console.log(`Connecting to ${platform}...`);
      // await axios.post(`/api/connect/${platform}`, {}, { withCredentials: true });
    } catch (error) {
      console.error(`Error connecting to ${platform}:`, error);
    }
  };

   // Logout functionality
   const handleLogout = async () => {
     try {
       await axios.post('https://ecommercedashboard-rshy.onrender.com/auth/logout', {}, { 
         withCredentials: true,
         validateStatus: (status) => status < 500
       });
       navigate('/login');
     } catch (error) {
       console.error('Error during logout:', error);
       alert('Failed to log out. Please try again.');
     }
   };
 
   // Fetch user data
   useEffect(() => {
     const fetchUserData = async () => {
       try {
         const response = await axios.get('https://ecommercedashboard-rshy.onrender.com/api/user', {
           withCredentials: true
         });
         setUserData(response.data);
       } catch (err) {
         setError('Failed to fetch user data');
         console.error('Error fetching user data:', err);
       } finally {
         setLoading(false);
       }
     };
 
     fetchUserData();
   }, []);
 
   if (loading) return <div>Loading profile...</div>;
   if (error) return <div className="error-message">{error}</div>;
 
   return (
     <div className="profile-container">
       <div className="profile-header">
       <img src= "programmer.png"
       
  alt="Profile" 
  className="profile-image" 
/>

         <div className="profile-info">
           <h2>{userData?.name || 'No Name'}</h2>
           <p>{userData?.email || 'No Email'}</p>
         </div>
       </div>

       <div className="social-section">
        <h3>Social Networks</h3>
        <button 
          className="add-social-btn"
          onClick={() => handleSocialConnection('twitter')}
        >
          Add Social Network
        </button>

        <div className="social-connections">
          <div className="social-item">
            <span className="social-icon">🐦</span>
            <div className="social-info">
              <h4>Twitter</h4>
              
            </div>
            <button 
              onClick={() => handleSocialConnection('twitter')}
            >
              
            </button>
          </div>
        </div>
      </div>

      <div className="help-section">
        <h3>Help Portavore</h3>
        <p>Need assistance? Contact our support team.</p>
        <button className="help-btn">Get Help</button>
      </div>

 
       <div className="profile-footer">
         <button className="logout-btn" onClick={handleLogout}>
           Log Out
         </button>
       </div>
     </div>
   );
 };
 
 export default Home;

