const config = {
    clientId: '51092626205e4fac987da217409b5b25',
    redirectUri: window.location.origin + window.location.pathname,
    scopes: [
        'user-read-private',
        'user-read-email',
        'user-library-read',
        'user-top-read',
        'user-read-recently-played'
    ].join(' ')
};
