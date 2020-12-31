import { ValidationError } from 'class-validator';

import { OAuth2Error } from './error';

/**
 * The request is missing a required parameter, includes an
 * unsupported parameter value (other than grant type),
 * repeats a parameter, includes multiple credentials,
 * utilizes more than one mechanism for authenticating the
 * client, or is otherwise malformed.
 * @see https://tools.ietf.org/html/rfc6749#section-5.2
 */
export class InvalidRequestError extends OAuth2Error {
    constructor(public error_description?: string, public error_uri?: string, validationErrors?: ValidationError[]) {
        super('invalid_request', error_description, error_uri, 400, validationErrors);
    }
}
