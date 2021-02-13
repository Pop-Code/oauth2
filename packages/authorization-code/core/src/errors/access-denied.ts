import { OAuth2Error } from '@pop-code/oauth2-common';

/**
 * The resource owner or authorization server denied the request.
 * @see https://tools.ietf.org/html/rfc6749#section-4.2.2.1
 */
export class AccessDeniedError extends OAuth2Error {
    constructor(public errorDescription?: string, public errorUri?: string) {
        super('access_denied', errorDescription, errorUri, 403);
    }
}
