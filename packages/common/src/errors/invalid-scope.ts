import { OAuth2Error } from './error';

/**
 * The requested scope is invalid, unknown, malformed, or
 * exceeds the scope granted by the resource owner.
 * @see https://tools.ietf.org/html/rfc6749#section-5.2
 */
export class InvalidScopeError extends OAuth2Error {
    constructor(public error_description?: string, public error_uri?: string) {
        super('invalid_scope', error_description, error_uri);
    }
}
