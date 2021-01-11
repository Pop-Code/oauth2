import {
    GrantType,
    InvalidClientError,
    InvalidScopeError,
    OAuth2Client,
    OAuth2ClientProvider,
    OAuth2Grant,
    OAuth2TokenProvider,
    UnauthorizedClientError,
    UnauthorizedError,
} from '@pop-code/oauth2-common';
import { isEmpty } from 'class-validator';
import uniqid from 'uniqid';

import { OAuth2GrantClientCredentialsOptions } from './options';
import { OAuth2ClientCredentialsRequest } from './request';
import { OAuth2ClientCredentialsTokenResponse } from './response';
import { OAuth2ClientCredentialsToken } from './token';

/**
 * OAuth2 Client Credentials Grant
 * @see https://tools.ietf.org/html/rfc6749#section-4.4
 */
export abstract class AbstractOAuth2GrantClientCredentials<
    C extends OAuth2Client,
    T extends OAuth2ClientCredentialsToken,
    R = any
> implements OAuth2Grant<C, T, R> {
    type = GrantType.CLIENT_CREDENTIALS;

    constructor(
        protected readonly config: OAuth2GrantClientCredentialsOptions,
        protected clientProvider: OAuth2ClientProvider<C>,
        protected tokenProvider: OAuth2TokenProvider<T>
    ) {}

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
        if (credentials === undefined || credentials.clientSecret === undefined) {
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
        const oauth2Request = await this.initTokenRequest(request);
        await oauth2Request.validate();

        // authenticate the client
        const client = await this.authenticateClient(oauth2Request);
        if (client === undefined) {
            // TODO must add the "WWW-Authenticate header set to basic if client has been auth form header";
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
            this.config.accessTokenLifeTime,
            authenticatedScope
        );
        const tokenReponse = await this.createTokenResponse(token);
        await this.tokenProvider.save(token);

        return tokenReponse;
    }

    setClientProvider(clientProvider: OAuth2ClientProvider<C>) {
        this.clientProvider = clientProvider;
        return this;
    }

    setTokenProvider(tokenProvider: OAuth2TokenProvider<T>) {
        this.tokenProvider = tokenProvider;
        return this;
    }

    async authenticate(accessToken?: string) {
        if (typeof accessToken !== 'string' || accessToken === '') {
            throw new UnauthorizedError('No authentication given');
        }

        // get the token from storage
        const token = await this.tokenProvider.findOneByAcessToken(accessToken);
        if (typeof token !== 'object') {
            // check token invalid | expired | and more
            throw new UnauthorizedError('Invalid token');
        }

        // get the client from token
        return await this.clientProvider.findOneById(token.getClientId());
    }

    abstract initTokenRequest(request: R): Promise<OAuth2ClientCredentialsRequest>;
    abstract createOAuth2Token(client: C, accessToken: string, expiresIn?: number, scope?: string): Promise<T>;
}
