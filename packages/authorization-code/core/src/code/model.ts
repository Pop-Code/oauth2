export interface OAuth2AuthorizationCode {
    getExpiresIn: () => number | undefined;
    getScope: () => string | undefined;
    getClientId: () => string;
    getResourceOwnerId: () => string;
    getRedirectUri: () => string;
}
