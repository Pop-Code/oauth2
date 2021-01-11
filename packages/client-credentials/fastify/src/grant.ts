import { AbstractOAuth2GrantClientCredentials } from '@pop-code/oauth2-client-credentials';
import { OAuth2Client, OAuth2Token } from '@pop-code/oauth2-common';
import { FastifyRequest } from 'fastify';

import { FastifyOAuth2ClientCredentialsRequest } from './request';

export abstract class FastifyOAuth2GrantClientCredentials<
    C extends OAuth2Client,
    T extends OAuth2Token,
    R extends FastifyRequest = any
> extends AbstractOAuth2GrantClientCredentials<C, T, R> {
    async initTokenRequest(request: FastifyRequest) {
        return new FastifyOAuth2ClientCredentialsRequest(request);
    }
}
