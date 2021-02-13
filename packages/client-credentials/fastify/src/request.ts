import { OAuth2ClientCredentialsRequest } from '@pop-code/oauth2-client-credentials';
import { FastifyRequest } from 'fastify';

export class FastifyOAuth2ClientCredentialsRequest extends OAuth2ClientCredentialsRequest {
    constructor(request: FastifyRequest) {
        super(request);
        if (request === undefined) {
            throw new Error('NANANANA');
        }
        this.client_id = (request.body as any).client_id;
        this.client_secret = (request.body as any).client_secret;
        this.scope = (request.body as any).scope;
    }

    async validate() {
        this.checkRequestContentType(this.request.headers['content-type'] as string);
        await super.validate();
    }

    getBasicAuthorizationHeader() {
        return this.request.headers.authorization;
    }
}
