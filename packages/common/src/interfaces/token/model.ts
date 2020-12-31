export interface OAuth2Token {
    getType: () => string;
    getExpiresIn: () => number | undefined;
    getAccessToken: () => string;
    getScope: () => string | undefined;
    getClientId: () => string;
}
