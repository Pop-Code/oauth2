import { GrantType } from '../constants';
import { OAuth2Client } from './client';
import { OAuth2TokenResponse } from './reponse';
import { OAuth2TokenRequest } from './requests/token';
import { OAuth2Token } from './token';

export interface OAuth2Grant<C extends OAuth2Client, T extends OAuth2Token, R = any> {
    /**
     * The grant type
     */
    readonly type: GrantType | string;

    /**
     * Create the OAuth2TokenResponse
     * @see https://tools.ietf.org/html/rfc6749#section-4.4.3
     */
    createTokenResponse: (token: T, client: C) => Promise<OAuth2TokenResponse>;

    /*******************************************/
    // Controller implementation
    /*******************************************/

    /**
     * Authenticate the client
     * This method read the request and and return an object implementing the OAuth2Client interface
     * @see https://tools.ietf.org/html/rfc6749#section-10.1
     */
    authenticateClient: (request: OAuth2TokenRequest) => Promise<C | undefined>;

    /**
     * Token endpoint
     * This method return an object implementing the OAuth2TokenResponse interface
     * @see https://tools.ietf.org/html/rfc6749#section-3.2
     */
    token: (request: R) => Promise<OAuth2TokenResponse>;

    /**
     * Validate the requested scope
     * The method return a Promise that resolve to false, to the requested scope, or to a partial requested scope
     * @see https://tools.ietf.org/html/rfc6749#section-3.3
     */
    requestScope: (requestedScope: string, client: C) => Promise<false | string>;
}
