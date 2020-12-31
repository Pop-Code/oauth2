import { OAuth2Error } from './error';

/**
 * Client authentication failed (e.g., unknown client, no
 * client authentication included, or unsupported
 * authentication method).  The authorization server MAY
 * return an HTTP 401 (Unauthorized) status code to indicate
 * which HTTP authentication schemes are supported.  If the
 * client attempted to authenticate via the "Authorization"
 * request header field, the authorization server MUST
 * respond with an HTTP 401 (Unauthorized) status code and
 * include the "WWW-Authenticate" response header field
 * matching the authentication scheme used by the client.
 * @see https://tools.ietf.org/html/rfc6749#section-5.2
 */
export class InvalidClientError extends OAuth2Error {
    constructor(public error_description?: string, public error_uri?: string) {
        super('invalid_client', error_description, error_uri);
    }
}
