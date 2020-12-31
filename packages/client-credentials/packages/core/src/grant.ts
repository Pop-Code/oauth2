import {
    GrantType,
    InvalidClientError,
    InvalidScopeError,
    OAuth2Client,
    OAuth2ClientProvider,
    OAuth2Grant,
    OAuth2Options,
    OAuth2Token,
    OAuth2TokenProvider,
    UnauthorizedClientError,
} from '@pop-code/oauth2-common';
import { isEmpty } from 'class-validator';
import uniqid from 'uniqid';

import { OAuth2ClientCredentialsRequest } from './request';
import { OAuth2ClientCredentialsTokenResponse } from './response';

/**
 * OAuth2 Client Credentials Grant
 * @see https://tools.ietf.org/html/rfc6749#section-4.4
 */
export abstract class AbstractOAuth2GrantClientCredentials<C extends OAuth2Client, T extends OAuth2Token, R = any>
    implements OAuth2Grant<C, T, R> {
    type = GrantType.CLIENT_CREDENTIALS;

    protected clientProvider: OAuth2ClientProvider<C>;

    protected tokenProvider: OAuth2TokenProvider<T>;

    constructor(readonly config: OAuth2Options) {}

    async generateAccessToken(client: C) {
        return uniqid();
    }

    async createTokenResponse(token: T) {
        const response = new OAuth2ClientCredentialsTokenResponse();
        response.token_type = token.getType();
        response.expires_in = token.getExpiresIn();
        response.access_token = token.getAccessToken();
        response.scope = token.getScope();
        return response;
    }

    async requestScope(requestedScope: string, client: C): Promise<string | false> {
        const requested = requestedScope.split(' ');
        const supported = client.getSupportedScopes();
        const authorized = requested.filter((s) => supported.includes(s));
        if (authorized.length > 0) {
            return authorized.join(' ');
        }
        return false;
    }

    async authenticateClient(request: OAuth2ClientCredentialsRequest) {
        const credentials = request.getClientCredentials();
        if (credentials === undefined) {
            throw new InvalidClientError('Invalid client credentials');
        }
        const client = await this.clientProvider.findOneByIdAndSecret(credentials.clientId, credentials.clientSecret);
        if (client === undefined) {
            throw new InvalidClientError('Invalid client credentials');
        }
        return client;
    }

    async token(request: R) {
        // get the request
        const oauth2Request = await this.initRequest(request);
        await oauth2Request.validate();

        // authenticate the client
        const client = await this.authenticateClient(oauth2Request);
        if (client === undefined) {
            throw new InvalidClientError('Invalid client credentials');
        }

        // check the client grant type
        if (!client.getSupportedGrantTypes().includes(oauth2Request.grantType)) {
            throw new UnauthorizedClientError(
                `The authenticated client is not authorized to use the "${GrantType.CLIENT_CREDENTIALS}" grant type`
            );
        }

        // check the authenticated scope
        let authenticatedScope: string | false | undefined;
        if (!isEmpty(oauth2Request.scope)) {
            authenticatedScope = await this.requestScope(oauth2Request.scope ?? '', client);
        }
        if (authenticatedScope === false) {
            throw new InvalidScopeError(
                'The requested scope is invalid, unknown, malformed, or exceeds the scope granted by the resource owner'
            );
        }

        // create a token
        const accessToken = await this.generateAccessToken(client);
        const token = await this.createOAuth2Token(
            client,
            accessToken,
            this.config.accessTokenLifetime, // TODO create a getter on the grant
            authenticatedScope
        );
        const tokenReponse = await this.createTokenResponse(token);
        await this.tokenProvider.save(token);

        return tokenReponse;
    }

    setProviders(clientProvider: OAuth2ClientProvider<C>, tokenProvider: OAuth2TokenProvider<T>) {
        this.clientProvider = clientProvider;
        this.tokenProvider = tokenProvider;
        return this;
    }

    // abstract implementation
    abstract initRequest(request: R): Promise<OAuth2ClientCredentialsRequest>;
    abstract createOAuth2Token(client: C, accessToken: string, expiresIn?: number, scope?: string): Promise<T>;

    // WIP
    async authenticate(request: R) {}
}
