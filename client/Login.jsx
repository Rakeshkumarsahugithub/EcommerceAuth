import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isOTPRequested, setIsOTPRequested] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Handle login with email, password, and OTP
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const payload = { email, password, otp }; // Always include OTP

      const response = await axios.post(
        'http://localhost:5001/auth/login',
        payload,
        { withCredentials: true }
      );

      if (response.data.message === 'Login successful') {
        alert('Login successful');
        navigate('/home'); // Redirect on success
      } else {
        alert(response.data.message);
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message); // Set error message
        if (err.response.data.message.includes('OTP')) {
          setOtp('');
          setIsOTPRequested(false);
        }
      } else {
        setError('An error occurred. Please try again.');
      }
    }
  };

  // Handle OTP request
  const handleSendOTP = async () => {
    try {
      const response = await axios.post('http://localhost:5001/auth/send-otp', { email });
      if (response.data.message === 'OTP sent successfully') {
        setIsOTPRequested(true); // Show OTP input field
        setError(''); // Clear any previous errors
        alert('OTP sent to your email');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('http://localhost:5001/auth/check', {
          withCredentials: true
        });
        if (response.data.authenticated) {
          navigate('/home');
        }
      } catch (error) {
        console.log('Authentication check failed');
      }
    };
    checkAuth();
  }, [navigate]);

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5001/auth/google';
  };

  return (
    <div className='sign-up-container'>
      <h2>Login</h2>
      <form className='sign-up-form' onSubmit={handleLogin}>
        {/* Email Input */}
        <label htmlFor="email">Email:</label>
        <input
          id='email'
          type='email'
          placeholder='Email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Password Input */}
        <label htmlFor='password'>Password:</label>
        <input
          id='password'
          type='password'
          placeholder='**********'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* OTP Input and Send OTP Button */}
        <div className="otp-container">
          <label htmlFor='otp'>OTP:</label>
          <input
            id='otp'
            type='text'
            placeholder='Enter OTP'
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <button
            type='button'
            onClick={handleSendOTP}
            disabled={!email}
            style={{
              flex: '0 0 120px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12.5px'
            }}
          >
            Send OTP
          </button>
        </div>

        {/* Display error message */}
        {error && <p className="error-message" style={{ color: 'red' }}>{error}</p>}

        {/* Login Button */}
        <button type='submit'>Log In</button>

        {/* Google Login Button */}
        <div 
          className="google-btn"
          onClick={handleGoogleLogin}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#4285F4',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            margin: '10px 0'
          }}
        >
          <img 
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google logo" 
            style={{ width: '20px', height: '20px', marginRight: '10px' }}
          />
          Continue with Google
        </div>

        <Link to={"/forgotPassword"}>Forgot password?</Link>
        <p>Don't have an account? <Link to="/">Sign Up</Link></p>
      </form>
    </div>
  );
};

export default Login;

