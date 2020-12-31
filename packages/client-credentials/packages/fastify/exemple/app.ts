import { OAuth2Error, UnauthorizedError } from '@pop-code/oauth2-common';
import Fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import formBody from 'fastify-formbody';

import { OAuth2ClientTest, OAuth2ClientTestProvider, OAuth2TokenTestProvider } from '../../../../../exemple/models';
import { FastifyOAuth2 } from '../src/oauth2';
import { FastifyOauth2ClientCredentialsTest } from './grant';

export const createApplication = async (): Promise<[FastifyInstance, FastifyOAuth2]> => {
    const clientProvider = new OAuth2ClientTestProvider();
    const tokenProvider = new OAuth2TokenTestProvider();
    const oauth2 = new FastifyOAuth2(clientProvider, tokenProvider);
    oauth2.addGrant(
        new FastifyOauth2ClientCredentialsTest({
            accessTokenLifetime: 3600,
            refreshTokenLifetime: 3600 * 24 * 7
        })
    );

    // create an oauth2 client in memory
    await oauth2.clientProvider.save(new OAuth2ClientTest());

    // create the app
    const app = Fastify({ logger: false });

    await app.register(formBody);

    // handle token endpoint
    app.post('/oauth2/token', oauth2.tokenMiddleware());

    // protect an endpoint
    app.get('/protected', async (req: FastifyRequest, reply: FastifyReply) => {
        await oauth2.authenticateMiddleware()(req, reply);
        await reply.send('Hello client is authenticated');
    });

    // handle errors
    app.setErrorHandler((e: Error, req: FastifyRequest, reply: FastifyReply) => {
        if (e instanceof OAuth2Error || e instanceof UnauthorizedError) {
            reply
                .status(e.statusCode)
                .send(e.toJSON())
                .then(
                    () => {},
                    (e) => {
                        throw e;
                    }
                );
        }
    });

    return [app, oauth2];
};
