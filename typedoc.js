module.exports = {
    out: 'docs',
    exclude: ['**/test/**'],
    theme: 'default',
    name: 'Pop-Code OAuth2 Code Documentation',
    includeVersion: true,
    excludeExternals: true,
    excludePrivate: false,
    hideGenerator: true,
    entryPoints: ['./packages']
};
