import { OAuth2Error, UnauthorizedError } from '@pop-code/oauth2-common';
import express, { Application, NextFunction, Request, Response } from 'express';

import { OAuth2ClientTest, OAuth2ClientTestProvider, OAuth2TokenTestProvider } from '../../../../../exemple/models';
import { ExpressOAuth2 } from '../src/oauth2';
import { ExpressOauth2ClientCredentialsTest } from './grant';

export const createApplication = async (): Promise<[Application, ExpressOAuth2]> => {
    const clientProvider = new OAuth2ClientTestProvider();
    const tokenProvider = new OAuth2TokenTestProvider();
    const oauth2 = new ExpressOAuth2(clientProvider, tokenProvider);
    oauth2.addGrant(
        new ExpressOauth2ClientCredentialsTest({
            accessTokenLifetime: 3600,
            refreshTokenLifetime: 3600 * 24 * 7
        })
    );

    // create an oauth2 client in memory
    await oauth2.clientProvider.save(new OAuth2ClientTest());

    // create the app
    const app = express();

    // handle token endpoint
    app.post('/oauth2/token', express.urlencoded({ extended: true }), oauth2.tokenMiddleware());

    // protect an endpoint
    app.get('/protected', oauth2.authenticateMiddleware(), (req: Request, res: Response) =>
        res.send('Hello client is authenticated')
    );

    // handle errors
    app.use((e: Error, req: Request, res: Response, next: NextFunction) => {
        if (e instanceof OAuth2Error || e instanceof UnauthorizedError) {
            return res.status(e.statusCode).send(e.toJSON());
        }
        next(e);
    });

    return [app, oauth2];
};
