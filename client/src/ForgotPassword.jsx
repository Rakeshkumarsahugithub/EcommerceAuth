
import axios from 'axios';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';


const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const navigate = useNavigate();
  
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        try {
            const response = await axios.post('https://ecommercedashboard-rshy.onrender.com/auth/forgot-password', { email });
            setEmail('');
            alert(response.data.message); // Show the message from the response
            navigate('/login');
        } catch (err) {
            if (err.response) {
                alert(err.response.data.message);
            } else {
                alert('An error occurred. Please try again.');
            }
        }
    };
    
  
    return (
      <div className='sign-up-container'>
        <h2>Forgot Password</h2>
        <form className='sign-up-form' onSubmit={handleSubmit}>
        
          <label htmlFor="email">Email:</label>
          <input 
            id='email'
            type='email' 
            placeholder='Email'
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
  
          <button type='submit'>Send</button>
        </form>
      </div>
    );
}

export default ForgotPassword
