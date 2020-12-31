import { GrantType } from '../constants';
import { OAuth2Client, OAuth2ClientProvider } from './client';
import { OAuth2Options } from './options';
import { OAuth2TokenResponse } from './reponse';
import { OAuth2TokenRequest } from './requests/token';
import { OAuth2Token, OAuth2TokenProvider } from './token';

export interface OAuth2Grant<C extends OAuth2Client, T extends OAuth2Token, R = any> {
    /**
     * The grant type
     */
    readonly type: GrantType | string;

    /**
     * The options of the oauth2 grant implementations
     */
    readonly config: OAuth2Options;

    setProviders: (clientProvider: OAuth2ClientProvider<C>, tokenProvider: OAuth2TokenProvider<T>) => this;

    /**
     * Generate an access token string
     * @see https://tools.ietf.org/html/rfc6749#section-1.4
     */
    generateAccessToken: (client: C) => Promise<string>;

    /**
     * Generate an refresh token string
     * @see https://tools.ietf.org/html/rfc6749#section-1.5
     */
    generateRefreshToken?: (client: C) => Promise<string>;

    /**
     * Create the OAuth2Token
     * This method return an object implementing the OAuth2Token interface
     */
    createOAuth2Token: (client: C, accessToken: string, expiresIn?: number, scope?: string) => Promise<T>;

    /**
     * Create the OAuth2TokenResponse
     * @see https://tools.ietf.org/html/rfc6749#section-4.4.3
     */
    createTokenResponse: (token: T, client: C) => Promise<OAuth2TokenResponse>;

    /*******************************************/
    // Controller implementation
    /*******************************************/

    /**
     * Parse the native http request
     * This method return an object implementing the OAuth2Request<Request> interface
     */
    initRequest: (request: R) => Promise<OAuth2TokenRequest>;

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
     * auth endpoint
     * @todo docs
     */
    authenticate: (request: R) => Promise<any>;

    /**
     * Validate the requested scope
     * The method return a Promise that resolve to false, to the requested scope, or to a partial requested scope
     * @see https://tools.ietf.org/html/rfc6749#section-3.3
     */
    requestScope: (requestedScope: string, client: C) => Promise<false | string>;
}
