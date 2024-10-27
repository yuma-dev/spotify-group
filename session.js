class SessionManager {
    constructor() {
        this.sessionData = null;
    }

    decodeSessionData(encodedData) {
        try {
            return JSON.parse(atob(encodedData));
        } catch (error) {
            console.error('Failed to decode session data:', error);
            return null;
        }
    }

    storeSession(data) {
        this.sessionData = data;
        localStorage.setItem('groupSession', JSON.stringify(data));
    }

    getStoredSession() {
        const stored = localStorage.getItem('groupSession');
        return stored ? JSON.parse(stored) : null;
    }

    clearSession() {
        localStorage.removeItem('groupSession');
        this.sessionData = null;
    }
}

const sessionManager = new SessionManager();
