class SpotifyAuthHandler {
    constructor() {
        this.sessionManager = sessionManager;
    }

        async handleCallback(code) {
        try {
            // Exchange code for tokens
            const response = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    grant_type: 'authorization_code',
                    code: code,
                    redirect_uri: config.redirectUri,
                    client_id: config.clientId,
                    client_secret: config.clientSecret,
                })
            });

            const tokenData = await response.json();
            
            // Use token to get user data
            const userData = await this.getUserData(tokenData.access_token);
            
            // Generate a unique code combining session data and user data
            const joinCode = this.generateJoinCode(userData);
            
            // Show code to user
            document.getElementById('loading').classList.add('hidden');
            document.getElementById('success').classList.remove('hidden');
            document.getElementById('success').innerHTML = `
                <h1>Successfully Connected!</h1>
                <p>Please copy this code and send it to your friend:</p>
                <div class="code-display">
                    <code>${joinCode}</code>
                    <button onclick="navigator.clipboard.writeText('${joinCode}')">Copy</button>
                </div>
                <p>You can close this window after copying the code.</p>
            `;
        } catch (error) {
            this.showError('Failed to get user data: ' + error.message);
        }
    }

    async getUserData(accessToken) {
        // Get user's listening data
        const [profile, topTracks, topArtists, savedTracks] = await Promise.all([
            this.fetchSpotifyApi('https://api.spotify.com/v1/me', accessToken),
            this.fetchSpotifyApi('https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=long_term', accessToken),
            this.fetchSpotifyApi('https://api.spotify.com/v1/me/top/artists?limit=50&time_range=long_term', accessToken),
            this.fetchSpotifyApi('https://api.spotify.com/v1/me/tracks?limit=50', accessToken)
        ]);

        return {
            profile,
            topTracks: topTracks.items,
            topArtists: topArtists.items,
            savedTracks: savedTracks.items.map(item => item.track)
        };
    }

    generateJoinCode(userData) {
        // Compress and encode the data
        const compressed = JSON.stringify(userData);
        return btoa(compressed);
    }
    
    async handleInitialLoad() {
        const urlParams = new URLSearchParams(window.location.search);
        
        // Check if this is the initial join request
        if (urlParams.has('session')) {
            const sessionData = this.sessionManager.decodeSessionData(urlParams.get('session'));
            if (!sessionData) {
                this.showError('Invalid session data');
                return;
            }

            this.sessionManager.storeSession(sessionData);
            this.redirectToSpotifyAuth();
        }
        // Check if this is the callback from Spotify
        else if (urlParams.has('code')) {
            await this.handleCallback(urlParams.get('code'));
        }
        // No valid parameters found
        else {
            this.showError('Invalid request');
        }
    }

    redirectToSpotifyAuth() {
        const params = new URLSearchParams({
            client_id: config.clientId,
            response_type: 'code',
            redirect_uri: config.redirectUri,
            scope: config.scopes,
            state: btoa(JSON.stringify({ timestamp: Date.now() }))
        });

        window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
    }

    async handleCallback(code) {
        const sessionData = this.sessionManager.getStoredSession();
        if (!sessionData) {
            this.showError('No session data found');
            return;
        }

        // Create the callback URL for the desktop app
        const callbackData = {
            code,
            session: sessionData
        };

        // Redirect to desktop app with data
        const encodedData = btoa(JSON.stringify(callbackData));
        window.location.href = `spotify-group-app://callback?data=${encodedData}`;
        
        // Show success message
        this.showSuccess();
    }

    showError(message) {
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('error').classList.remove('hidden');
        document.getElementById('error-message').textContent = message;
    }

    showSuccess() {
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('success').classList.remove('hidden');
    }
}

// Initialize and run
const authHandler = new SpotifyAuthHandler();
window.addEventListener('load', () => authHandler.handleInitialLoad());
