const config = {
    clientId: 'bb39de3fd45d476880f0373663e4a751',
    redirectUri: window.location.origin + window.location.pathname,
    scopes: [
        'user-read-private',
        'user-read-email',
        'user-library-read',
        'user-top-read',
        'user-read-recently-played'
    ].join(' ')
};
