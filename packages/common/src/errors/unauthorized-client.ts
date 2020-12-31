import { OAuth2Error } from './error';

/**
 * The authenticated client is not authorized to use this
 * authorization grant type.
 * @see https://tools.ietf.org/html/rfc6749#section-5.2
 */
export class UnauthorizedClientError extends OAuth2Error {
    constructor(public error_description?: string, public error_uri?: string) {
        super('unauthorized_client', error_description, error_uri);
    }
}
