import { OAuth2ClientCredentialsRequest } from '@pop-code/oauth2-client-credentials';
import { Request } from 'express';

export class ExpressOAuth2ClientCredentialsRequest extends OAuth2ClientCredentialsRequest {
    constructor(request: Request) {
        super(request);
        if (request === undefined) {
            throw new Error('NANANANA');
        }
        this.client_id = request.body.client_id;
        this.client_secret = request.body.client_secret;
        this.scope = request.body.scope;
    }

    async validate() {
        this.checkRequestContentType(this.request.headers['content-type'] as string);
        await super.validate();
    }

    getBasicAuthorizationHeader() {
        return this.request.headers.authorization;
    }
}
