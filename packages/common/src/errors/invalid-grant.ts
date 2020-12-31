import { OAuth2Error } from './error';

/**
 * The provided authorization grant (e.g., authorization
 * code, resource owner credentials) or refresh token is
 * invalid, expired, revoked, does not match the redirection
 * URI used in the authorization request, or was issued to
 * another client.
 * @see https://tools.ietf.org/html/rfc6749#section-5.2
 */
export class InvalidGrantError extends OAuth2Error {
    constructor(public error_description?: string, public error_uri?: string) {
        super('invalid_grant', error_description, error_uri);
    }
}
