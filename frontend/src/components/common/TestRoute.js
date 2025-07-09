import React from 'react';

const TestRoute = ({ routeName }) => {
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f0f0f0', 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>
        Test Route: {routeName}
      </h1>
      <p style={{ color: '#666', fontSize: '18px' }}>
        This is a test page to verify routing is working correctly.
      </p>
      <div style={{ marginTop: '20px' }}>
        <a href="/" style={{ 
          color: '#007bff', 
          textDecoration: 'none',
          padding: '10px 20px',
          border: '1px solid #007bff',
          borderRadius: '5px'
        }}>
          Go Back Home
        </a>
      </div>
    </div>
  );
};

export default TestRoute; 