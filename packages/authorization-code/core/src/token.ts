export interface OAuth2AuthorizationCodeToken {
    getType: () => string;
    getExpiresIn: () => number | undefined;
    getAccessToken: () => string;
    getRefreshToken: () => string;
    getScope: () => string | undefined;
    getClientId: () => string;
    getResourceOwnerId: () => string;
}
