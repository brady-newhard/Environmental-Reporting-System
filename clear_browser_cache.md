# Clear Browser Cache for Localhost HTTPS Issues

## The Problem
Your browser has cached HTTPS redirects and security headers from previous visits, causing it to automatically redirect to HTTPS even when the server is configured for HTTP.

## Solution Steps

### 1. Clear Browser Cache and Cookies

#### Chrome/Edge:
1. Open Developer Tools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"
4. OR go to Settings > Privacy and Security > Clear browsing data
5. Select "All time" and check:
   - Browsing history
   - Cookies and other site data
   - Cached images and files
6. Click "Clear data"

#### Firefox:
1. Press Ctrl+Shift+Delete (Cmd+Shift+Delete on Mac)
2. Select "Everything" for time range
3. Check all boxes
4. Click "Clear Now"

#### Safari:
1. Go to Safari > Preferences > Privacy
2. Click "Manage Website Data"
3. Search for "localhost" and "127.0.0.1"
4. Remove all entries
5. Go to Safari > Develop > Empty Caches

### 2. Clear HSTS Settings

#### Chrome/Edge:
1. Go to `chrome://net-internals/#hsts`
2. In "Delete domain security policies" enter:
   - `localhost`
   - `127.0.0.1`
   - `192.168.1.203`
3. Click "Delete" for each

#### Firefox:
1. Go to `about:config`
2. Search for `security.tls.insecure_fallback_hosts`
3. Add `localhost,127.0.0.1,192.168.1.203`

### 3. Restart Your Browser
Completely close and reopen your browser.

### 4. Test the Fix
1. Start your Django server: `python manage.py runserver`
2. Open `http://localhost:8000` (NOT https)
3. The admin should work without redirects

### 5. If Still Having Issues

#### Try Incognito/Private Mode:
- Open an incognito/private window
- Navigate to `http://localhost:8000`
- This bypasses all cached settings

#### Clear DNS Cache:
```bash
# macOS
sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder

# Windows
ipconfig /flushdns

# Linux
sudo systemctl restart systemd-resolved
```

#### Reset Browser Settings:
- Chrome: Settings > Advanced > Reset and clean up > Restore settings to their original defaults
- Firefox: Help > Troubleshooting Information > Refresh Firefox

## Prevention
- Always use `http://` not `https://` for localhost development
- Don't visit `https://localhost:8000` even if prompted
- Use incognito mode for testing if you suspect cache issues 