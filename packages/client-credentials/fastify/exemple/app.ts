import { OAuth2Error, UnauthorizedError } from '@pop-code/oauth2-common';
import Fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import formBody from 'fastify-formbody';

import { OAuth2ClientTest, OAuth2ClientTestProvider, OAuth2TokenTestProvider } from '../../../../exemple/models';
import { FastifyOAuth2 } from '../src/oauth2';
import { FastifyOauth2GrantClientCredentialsTest } from './grant';

export const createApplication = async (): Promise<[FastifyInstance, FastifyOAuth2]> => {
    const clientProvider = new OAuth2ClientTestProvider();
    const tokenProvider = new OAuth2TokenTestProvider();
    const grant = new FastifyOauth2GrantClientCredentialsTest(
        { accessTokenLifeTime: 3600 },
        clientProvider,
        tokenProvider
    );

    const oauth2 = new FastifyOAuth2();
    oauth2.addGrant(grant);

    // create an oauth2 client in memory
    await clientProvider.save(new OAuth2ClientTest());

    // create the app
    const app = Fastify({ logger: false });

    await app.register(formBody);

    // handle token endpoint
    app.post('/oauth2/token', oauth2.tokenMiddleware());

    // protect an endpoint
    app.get('/protected', async (req: FastifyRequest, reply: FastifyReply) => {
        const client = await grant.authenticate(req.headers.authorization);
        if (client !== undefined) {
            await reply.send(`Hello client is authenticated => ' + ${client.getId() as string}`);
        } else {
            await reply.send(`Hello client is not authenticated`);
        }
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
