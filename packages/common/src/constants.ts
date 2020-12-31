/**
 * The OAuth2 Grants type
 * @see https://tools.ietf.org/html/rfc6749#section-1.3
 */
export enum GrantType {
    AUTHORIZATION_CODE = 'authorization_code',
    IMPLICIT = 'implicit',
    RESOURCE_OWNER_PASSWORD = 'password',
    CLIENT_CREDENTIALS = 'client_credentials'
}

export const grantTypes = Object.values(GrantType);
