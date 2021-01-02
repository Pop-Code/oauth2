import { Request } from 'express';

import { OAuth2ClientTest, OAuth2TokenTest } from '../../../../../exemple/models';
import { ExpressOAuth2GrantClientCredentials } from '../src/grant';

export class ExpressOauth2ClientCredentialsTest extends ExpressOAuth2GrantClientCredentials<
    OAuth2ClientTest,
    OAuth2TokenTest,
    Request
> {
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
}
