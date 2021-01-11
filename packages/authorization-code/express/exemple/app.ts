import { OAuth2Error, UnauthorizedError } from '@pop-code/oauth2-common';
import express, { Application, NextFunction, Request, Response } from 'express';

import {
    OAuth2ClientTest,
    OAuth2ClientTestProvider,
    OAuth2CodeTestProvider,
    OAuth2ResourceOwnerTest,
    OAuth2ResourceOwnerTestProvider,
    OAuth2TokenTestProvider,
} from '../../../../exemple/models';
import { ExpressOAuth2 } from '../src/oauth2';
import { ExpressOauth2GrantAuthorizationCodeTest } from './grant';

export const createApplication = async (): Promise<[Application, ExpressOAuth2]> => {
    const clientProvider = new OAuth2ClientTestProvider();
    const tokenProvider = new OAuth2TokenTestProvider();
    const codeProvider = new OAuth2CodeTestProvider();
    const resourceOwnerProvider = new OAuth2ResourceOwnerTestProvider();
    const grant = new ExpressOauth2GrantAuthorizationCodeTest(
        {
            codeLifeTime: 60 * 15,
            accessTokenLifeTime: 3600,
            refreshTokenLifeTime: 60 * 60 * 24 * 7
        },
        clientProvider,
        resourceOwnerProvider,
        tokenProvider,
        codeProvider
    );
    const oauth2 = new ExpressOAuth2();
    oauth2.addGrant(grant);

    // create data in memory, an oauth2 client and a resource owner
    await Promise.all([
        clientProvider.save(new OAuth2ClientTest()),
        resourceOwnerProvider.save(new OAuth2ResourceOwnerTest())
    ]);

    // create the app
    const app = express();

    app.get('/oauth2/authorize', grant.authorizeMiddleware());

    // handle token endpoint
    app.post('/oauth2/token', express.urlencoded({ extended: true }), oauth2.tokenMiddleware());

    // protect an endpoint
    // app.get('/protected', grant.authenticateMiddleware(), (req: Request, res: Response) =>
    //     res.send('Hello client is authenticated')
    // );

    // handle errors
    app.use((e: Error, req: Request, res: Response, next: NextFunction) => {
        if (e instanceof OAuth2Error || e instanceof UnauthorizedError) {
            return res.status(e.statusCode).send(e.toJSON());
        }
        next(e);
    });

    return [app, oauth2];
};
