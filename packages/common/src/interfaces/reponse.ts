/**
 * @see https://tools.ietf.org/html/rfc6749#section-5.1
 */
export interface OAuth2TokenResponse {
    token_type: 'bearer' | 'mac' | string;
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    scope?: string;
}
