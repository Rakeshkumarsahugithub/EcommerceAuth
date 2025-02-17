
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const { token } = useParams();  // Grab token from URL params
    const navigate = useNavigate();
  
    const handleSubmit = async (e) => {
      e.preventDefault();
  
      try {
        // Use the correct production URL for the password reset API
        const response = await axios.post(`https://ecommercedashboard-rshy.onrender.com/auth/reset-password/${token}`, { password });
        setPassword('');
        console.log(response.data);
       
        navigate('/login');  // Redirect to login page after password is reset
      } catch (err) {
        if (err.response) {
          alert(err.response.data.message);  // Show error message from backend
        } else {
          alert('An error occurred. Please try again.');
        }
      }
    };
  
    return (
      <div className='sign-up-container'>
        <h2>Reset Password</h2>
        <form className='sign-up-form' onSubmit={handleSubmit}>
          <label htmlFor="password">New Password:</label>
          <input 
            id='password'
            type='password' 
            placeholder='********'
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
          <button type='submit'>Send</button>
        </form>
      </div>
    );
}

export default ResetPassword;
