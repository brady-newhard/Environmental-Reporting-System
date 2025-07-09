// Quick diagnostic script to check app functionality
console.log('=== APP DIAGNOSTIC CHECK ===');

// Check if we're in the right environment
console.log('Environment:', window.location.href);
console.log('API URL:', import.meta.env?.VITE_API_URL || 'Not set');

// Check authentication
const token = localStorage.getItem('token');
console.log('Auth token:', token ? 'Present' : 'Missing');

// Check if API is reachable
fetch('http://localhost:8000/api/health/', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  }
})
.then(response => {
  console.log('API Health Check:', response.ok ? 'SUCCESS' : 'FAILED');
  return response.json();
})
.then(data => {
  console.log('API Response:', data);
})
.catch(error => {
  console.log('API Error:', error.message);
});

// Check if key components are loaded
console.log('=== COMPONENT CHECKS ===');
console.log('ReportTemplate available:', typeof ReportTemplate !== 'undefined');
console.log('Navigation available:', typeof Navigation !== 'undefined');

// Check for common errors
window.addEventListener('error', (event) => {
  console.log('JavaScript Error:', event.error);
});

console.log('=== DIAGNOSTIC COMPLETE ==='); 