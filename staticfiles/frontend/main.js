// Basic initialization
document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('root');
    root.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <h1>Environmental Reporting System</h1>
            <div id="auth-form" style="max-width: 300px; margin: 0 auto;">
                <input type="text" id="username" placeholder="Username" style="margin: 5px; padding: 5px;">
                <input type="password" id="password" placeholder="Password" style="margin: 5px; padding: 5px;">
                <button onclick="login()" style="margin: 5px; padding: 5px;">Login</button>
            </div>
            <div id="auth-status"></div>
            <div id="content" style="display: none;"></div>
        </div>
    `;
});

async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const statusDiv = document.getElementById('auth-status');
    
    try {
        const response = await fetch('/api/token/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            statusDiv.innerHTML = 'Login successful!';
            statusDiv.style.color = 'green';
            loadContent();
        } else {
            statusDiv.innerHTML = 'Login failed. Please check your credentials.';
            statusDiv.style.color = 'red';
        }
    } catch (error) {
        statusDiv.innerHTML = 'Error connecting to server.';
        statusDiv.style.color = 'red';
        console.error('Error:', error);
    }
}

async function loadContent() {
    const token = localStorage.getItem('token');
    const contentDiv = document.getElementById('content');
    
    if (!token) {
        contentDiv.style.display = 'none';
        return;
    }

    try {
        const response = await fetch('/api/reports/draft/', {
            headers: {
                'Authorization': `Token ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            contentDiv.style.display = 'block';
            contentDiv.innerHTML = `
                <h2>Draft Report</h2>
                <pre>${JSON.stringify(data, null, 2)}</pre>
            `;
        } else if (response.status === 401) {
            localStorage.removeItem('token');
            location.reload();
        }
    } catch (error) {
        console.error('Error loading content:', error);
    }
} 