import {
    GrantType,
    InvalidClientError,
    InvalidGrantError,
    InvalidScopeError,
    OAuth2Client,
    OAuth2ClientProvider,
    OAuth2Grant,
    OAuth2TokenProvider,
    UnauthorizedClientError,
} from '@pop-code/oauth2-common';
import { isEmpty } from 'class-validator';
import uniqid from 'uniqid';

import { OAuth2AuthorizationCodeRequest } from './authorization-request';
import { OAuth2AuthorizationCode } from './code/model';
import { OAuth2CodeProvider } from './code/provider';
import { AccessDeniedError } from './errors/access-denied';
import { OAuth2GrantAuthorizationCodeOptions } from './options';
import { OAuth2ResourceOwner } from './resource-owner/model';
import { OAuth2ResourceOwnerProvider } from './resource-owner/provider';
import { OAuth2ClientCredentialsTokenResponse } from './response';
import { OAuth2AuthorizationCodeToken } from './token';
import { OAuth2AuthorizationCodeTokenRequest } from './token-request';

/**
 * OAuth2 Authorization Code Grant
 * @see https://tools.ietf.org/html/rfc6749#section-4.1
 */
export abstract class AbstractOAuth2GrantAuthorizationCode<
    C extends OAuth2Client,
    U extends OAuth2ResourceOwner,
    T extends OAuth2AuthorizationCodeToken,
    D extends OAuth2AuthorizationCode,
    R = any
> implements OAuth2Grant<C, T, R> {
    type = GrantType.AUTHORIZATION_CODE;

    constructor(
        readonly config: OAuth2GrantAuthorizationCodeOptions,
        protected clientProvider: OAuth2ClientProvider<C>,
        protected resourceOwnerProvider: OAuth2ResourceOwnerProvider<U>,
        protected tokenProvider: OAuth2TokenProvider<T>,
        protected codeProvider: OAuth2CodeProvider<D>
    ) {}

    async generateAccessToken(client: C) {
        return uniqid();
    }

    async generateRefreshToken(client: C) {
        return uniqid();
    }

    async generateAuthrorizationCode(client: C, resourceOwner: OAuth2ResourceOwner) {
        return uniqid();
    }

    async createTokenResponse(token: T) {
        const response = new OAuth2ClientCredentialsTokenResponse();
        response.token_type = token.getType();
        response.expires_in = token.getExpiresIn();
        response.access_token = token.getAccessToken();
        response.refresh_token = token.getRefreshToken();
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

    async authenticateClient(request: OAuth2AuthorizationCodeTokenRequest) {
        const credentials = request.getClientCredentials();
        if (credentials === undefined) {
            throw new InvalidClientError('Invalid client credentials');
        }
        const client = await this.clientProvider.findOneById(credentials.clientId);
        if (client === undefined) {
            throw new InvalidClientError('Invalid client credentials');
        }
        return client;
    }

    async authorize(request: R) {
        // (A)  The client initiates the flow by directing the resource owner's
        // user-agent to the authorization endpoint.  The client includes
        // its client identifier, requested scope, local state, and a
        // redirection URI to which the authorization server will send the
        // user-agent back once access is granted (or denied).
        const authRequest = await this.initAuthorizationRequest(request);
        await authRequest.validate();

        // get the client
        const client = await this.clientProvider.findOneById(authRequest.client_id);
        if (client === undefined) {
            throw new InvalidClientError('Invalid client');
        }
        // check the client grant type
        if (!client.getSupportedGrantTypes().includes(authRequest.grantType)) {
            throw new UnauthorizedClientError(
                `The authenticated client is not authorized to use the "${GrantType.AUTHORIZATION_CODE}" grant type`
            );
        }
        // check client implementation
        if (client.getSupportedRedirectUris === undefined) {
            throw new InvalidClientError('Client does not implement getSupportedRedirectUris');
        }

        // check the requested scope
        let requestedScope: string | false | undefined;
        if (!isEmpty(authRequest.scope)) {
            requestedScope = await this.requestScope(authRequest.scope ?? '', client);
        }
        if (requestedScope === false) {
            throw new InvalidScopeError(
                'The requested scope is invalid, unknown, malformed, or exceeds the scope granted by the resource owner'
            );
        }

        // validate the redirect uri
        let redirectUri: string;
        const supportedUris = client.getSupportedRedirectUris();
        if (authRequest.redirect_uri === undefined) {
            if (supportedUris.length === 0) {
                throw new InvalidClientError('Client did not return any supported redirect uri');
            }
            redirectUri = supportedUris[0];
        } else {
            redirectUri = authRequest.redirect_uri;
            if (!supportedUris.includes(redirectUri)) {
                throw new InvalidClientError(`Client does not support the redirect uri "${authRequest.redirect_uri}"`);
            }
        }

        // (B)  The authorization server authenticates the resource owner (via
        //     the user-agent) and establishes whether the resource owner
        //     grants or denies the client's access request.
        let resourceOwner: OAuth2ResourceOwner | undefined;
        try {
            resourceOwner = await this.authenticateResourceOwner(authRequest, client, requestedScope);
            if (resourceOwner === undefined) {
                throw new Error();
            }
        } catch (e) {
            throw new AccessDeniedError(e.message);
        }

        // (C)  Assuming the resource owner grants access, the authorization
        // server redirects the user-agent back to the client using the
        // redirection URI provided earlier (in the request or during
        // client registration). The redirection URI includes an
        // authorization code and any local state provided by the client
        // earlier.
        const code = await this.generateAuthrorizationCode(client, resourceOwner);
        const oauth2Code = await this.createOAuth2Code(client, resourceOwner, code, redirectUri, requestedScope);
        await this.codeProvider.save(oauth2Code);
        // build the uri redirect
        const uri = new URL(redirectUri);
        uri.searchParams.set('code', code);
        if (authRequest.state !== undefined) {
            uri.searchParams.set('state', authRequest.state);
        }

        return await this.redirect(request, uri);
    }

    async token(request: R) {
        // get the request
        const tokenRequest = await this.initTokenRequest(request);
        await tokenRequest.validate();

        // authenticate the client
        const client = await this.authenticateClient(tokenRequest);
        if (client === undefined) {
            throw new InvalidClientError('Invalid client credentials');
        }

        // check the client grant type
        if (!client.getSupportedGrantTypes().includes(tokenRequest.grantType)) {
            throw new UnauthorizedClientError(
                `The authenticated client is not authorized to use the "${GrantType.AUTHORIZATION_CODE}" grant type`
            );
        }

        // get the code from storage
        const oauth2Code = await this.codeProvider.findOneByCode(tokenRequest.code);
        if (oauth2Code === undefined) {
            throw new InvalidGrantError('Code is not valid');
        }

        // check the match of redirect uri
        if (oauth2Code.getRedirectUri() !== tokenRequest.redirect_uri) {
            throw new InvalidGrantError('Redirect uri does not match original redirect uri');
        }

        // get the resource owner
        const resourceOwner = await this.resourceOwnerProvider.findOneById(oauth2Code.getResourceOwnerId());
        if (resourceOwner === undefined) {
            throw new InvalidGrantError('Resource owner not found');
        }

        // create a token
        const token = await this.createOAuth2TokenFromCode(oauth2Code, client, resourceOwner);
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

    setCodeProvider(codeProvider: OAuth2CodeProvider<D>) {
        this.codeProvider = codeProvider;
        return this;
    }

    // abstract implementation
    abstract initAuthorizationRequest(request: R): Promise<OAuth2AuthorizationCodeRequest>;

    // token
    abstract initTokenRequest(request: R): Promise<OAuth2AuthorizationCodeTokenRequest>;

    abstract createOAuth2Code(
        client: C,
        resourceOwner: OAuth2ResourceOwner,
        code: string,
        redirectUri: string,
        scope?: string
    ): Promise<D>;

    abstract redirect(request: R, uri: URL): Promise<void>;

    abstract createOAuth2TokenFromCode(oauth2Code: D, client: C, resourceOwner: U): Promise<T>;

    /**
     * This method could be used to:
     *  - authenticate the resource owner from request
     *  - or retrieve an alreay authenticated resource owner
     *  - or redirect to the authorization server login, then redirect back to the current authorize endpoint again
     */
    abstract authenticateResourceOwner(
        request: OAuth2AuthorizationCodeRequest,
        client: C,
        scope?: string
    ): Promise<OAuth2ResourceOwner | undefined>;
}
