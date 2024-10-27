class SpotifyAuthHandler {
    constructor() {
        this.sessionManager = sessionManager;
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
