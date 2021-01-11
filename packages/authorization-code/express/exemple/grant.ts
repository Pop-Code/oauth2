import { OAuth2AuthorizationCodeRequest, OAuth2ResourceOwner } from '@pop-code/oauth2-authorization-code';
import { Request } from 'express';

import { OAuth2ClientTest, OAuth2CodeTest, OAuth2ResourceOwnerTest, OAuth2TokenTest } from '../../../../exemple/models';
import { ExpressOAuth2GrantAuthorizationCode } from '../src/grant';

export class ExpressOauth2GrantAuthorizationCodeTest extends ExpressOAuth2GrantAuthorizationCode<
    OAuth2ClientTest,
    OAuth2ResourceOwnerTest,
    OAuth2TokenTest,
    OAuth2CodeTest,
    Request
> {
    async createOAuth2Code(
        client: OAuth2ClientTest,
        resourceOwner: OAuth2ResourceOwner,
        code: string,
        redirectUri: string,
        scope?: string
    ): Promise<OAuth2CodeTest> {
        const oauth2Code = new OAuth2CodeTest();
        oauth2Code.clientId = client.getId();
        oauth2Code.code = code;
        oauth2Code.resourceOwnerId = resourceOwner.getId();
        oauth2Code.redirectUri = redirectUri;
        if (scope !== undefined) {
            oauth2Code.scope = scope;
        }
        oauth2Code.expiresIn = this.config.codeLifeTime;

        return oauth2Code;
    }

    async redirect(request: Request, uri: URL): Promise<void> {
        request.res?.redirect(uri.toString());
    }

    async createOAuth2TokenFromCode(
        oauth2Code: OAuth2CodeTest,
        client: OAuth2ClientTest,
        resourceOwner: OAuth2ResourceOwnerTest
    ) {
        const token = new OAuth2TokenTest();
        token.clientId = client.getId();
        token.resourceOwnerId = resourceOwner.getId();
        token.expiresIn = oauth2Code.getExpiresIn();
        token.accessToken = await this.generateAccessToken(client);
        token.refreshToken = await this.generateRefreshToken(client);
        token.scope = oauth2Code.getScope();
        return token;
    }

    async authenticateResourceOwner(request: OAuth2AuthorizationCodeRequest, client: OAuth2ClientTest, scope?: string) {
        // simultation return a fake user, we could do a return request.user
        return new OAuth2ResourceOwnerTest();
    }
}
