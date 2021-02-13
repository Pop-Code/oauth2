import { OAuth2AuthorizationCodeTokenRequest } from '@pop-code/oauth2-authorization-code';
import { Request } from 'express';

export class ExpressOAuth2AuthorizationCodeTokenRequest extends OAuth2AuthorizationCodeTokenRequest {
    constructor(request: Request) {
        super(request);
        if (request === undefined) {
            throw new Error('NANANANA');
        }
        this.client_id = request.body.client_id as string;
        this.client_secret = request.body.client_secret as string;
        this.redirect_uri = request.body.redirect_uri as string;
        this.code = request.body.code;
    }

    getBasicAuthorizationHeader() {
        return this.request.headers.authorization;
    }
}
