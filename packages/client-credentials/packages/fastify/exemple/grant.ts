import { FastifyRequest } from 'fastify';

import { OAuth2ClientTest, OAuth2TokenTest } from '../../../../../exemple/models';
import { FastifyOAuth2GrantClientCredentials } from '../src/grant';
import { FastifyOAuth2ClientCredentialsRequest } from '../src/request';

export class FastifyOauth2ClientCredentialsTest extends FastifyOAuth2GrantClientCredentials<
    OAuth2ClientTest,
    OAuth2TokenTest,
    FastifyRequest
> {
    async initRequest(request: FastifyRequest) {
        return new FastifyOAuth2ClientCredentialsRequest(request);
    }

    async createOAuth2Token(client: OAuth2ClientTest, accessToken: string, expiresIn?: number, scope?: string) {
        const token = new OAuth2TokenTest();
        if (typeof scope === 'string') {
            token.scope = scope;
        }
        token.access_token = accessToken;
        token.expires_in = expiresIn;
        token.clientId = client.getId();
        return token;
    }

    authenticateMiddleware() {
        return async (req: FastifyRequest & { oauth2?: any }) => {
            const client = await this.authenticate(req);
            req.oauth2 = { client };
        };
    }
}
