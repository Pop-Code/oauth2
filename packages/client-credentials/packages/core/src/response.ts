import { OAuth2TokenResponse } from '@pop-code/oauth2-common';

/**
 * @see https://tools.ietf.org/html/rfc6749#section-5.1
 */
export class OAuth2ClientCredentialsTokenResponse implements OAuth2TokenResponse {
    token_type: OAuth2TokenResponse['token_type'];
    access_token: OAuth2TokenResponse['token_type'];
    expires_in?: OAuth2TokenResponse['expires_in'];
    scope?: OAuth2TokenResponse['scope'];
}
