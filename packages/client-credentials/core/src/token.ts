export interface OAuth2ClientCredentialsToken {
    getType: () => string;
    getExpiresIn: () => number | undefined;
    getAccessToken: () => string;
    getScope: () => string | undefined;
    getClientId: () => string;
}
