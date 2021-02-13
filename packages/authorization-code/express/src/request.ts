import { OAuth2AuthorizationCodeRequest } from '@pop-code/oauth2-authorization-code';
import { Request } from 'express';

export class ExpressOAuth2AuthorizationCodeRequest extends OAuth2AuthorizationCodeRequest {
    constructor(request: Request) {
        super(request);
        if (request === undefined) {
            throw new Error('NANANANA');
        }
        this.client_id = request.query.client_id as string;
        this.scope = request.query.scope as string;
    }

    getBasicAuthorizationHeader() {
        return this.request.headers.authorization;
    }
}
