import {
    AbstractOAuth2GrantAuthorizationCode,
    OAuth2AuthorizationCode,
    OAuth2AuthorizationCodeToken,
    OAuth2ResourceOwner,
} from '@pop-code/oauth2-authorization-code';
import { OAuth2Client } from '@pop-code/oauth2-common';
import { NextFunction, Request, Response } from 'express';

import { ExpressOAuth2AuthorizationCodeRequest } from './request';
import { ExpressOAuth2AuthorizationCodeTokenRequest } from './token-request';

export abstract class ExpressOAuth2GrantAuthorizationCode<
    C extends OAuth2Client,
    U extends OAuth2ResourceOwner,
    T extends OAuth2AuthorizationCodeToken,
    D extends OAuth2AuthorizationCode,
    R extends Request = any
> extends AbstractOAuth2GrantAuthorizationCode<C, U, T, D, R> {
    async initAuthorizationRequest(request: Request) {
        return new ExpressOAuth2AuthorizationCodeRequest(request);
    }

    async initTokenRequest(request: Request) {
        return new ExpressOAuth2AuthorizationCodeTokenRequest(request);
    }

    authorizeMiddleware() {
        return (request: R, response: Response, next: NextFunction) => {
            this.authorize(request).catch(next);
        };
    }
}
