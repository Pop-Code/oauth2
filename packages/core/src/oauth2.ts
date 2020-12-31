import {
    InvalidRequestError,
    OAuth2Client,
    OAuth2ClientProvider,
    OAuth2Grant,
    OAuth2Interface,
    OAuth2Token,
    OAuth2TokenProvider,
    UnauthorizedError,
    UnsupportedGrantTypeError,
} from '@pop-code/oauth2-common';

export abstract class OAuth2<C extends OAuth2Client = any, T extends OAuth2Token = any, R = any>
    implements OAuth2Interface<C, T, R> {
    protected grants = new Map<string, OAuth2Grant<C, T>>();

    constructor(readonly clientProvider: OAuth2ClientProvider<C>, readonly tokenProvider: OAuth2TokenProvider<T>) {}

    getGrants() {
        return Array.from(this.grants.values());
    }

    getGrant<G extends OAuth2Grant<C, T>>(type: string): G {
        const grant = this.grants.get(type) as G;
        if (grant === undefined) {
            throw new UnsupportedGrantTypeError(`Unsupported grant type "${type}"`);
        }
        return grant;
    }

    addGrant(grant: OAuth2Grant<C, T>) {
        grant.setProviders(this.clientProvider, this.tokenProvider);
        this.grants.set(grant.type, grant);
        return this;
    }

    removeGrant(name: string) {
        return this.grants.delete(name);
    }

    async token(request: R) {
        // check the request
        await this.checkRequest(request);

        // extract the grant type from the request
        const grantType = await this.getGrantTypeFromRequest(request);
        if (grantType === undefined) {
            throw new InvalidRequestError('The grant_type parameter is required');
        }
        if (typeof grantType !== 'string' || grantType === '') {
            throw new InvalidRequestError('The grant_type parameter must be a string');
        }

        // get the grant instance
        const oauth2Grant = this.getGrant(grantType);

        // execute the grant
        return await oauth2Grant.token(request);
    }

    async authenticate(request: R) {
        // extract the token from request
        const accessToken = await this.getAccessTokenFromRequest(request);
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
        const client = await this.clientProvider.findOneById(token.getClientId());
        // if (!(client instanceof this.clientProvider.getClass())) {
        //     throw new Error('Not authenticated');
        // }

        return client;
    }

    abstract getAccessTokenFromRequest(request: R): Promise<string | undefined>;
    abstract getGrantTypeFromRequest(request: R): Promise<string | undefined>;
    abstract checkRequest(request: R): Promise<void>;
}
