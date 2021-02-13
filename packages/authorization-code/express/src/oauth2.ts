import { OAuth2 } from '@pop-code/oauth2';
import { InvalidRequestError, OAuth2Client, OAuth2Token } from '@pop-code/oauth2-common';
import { Request, Response } from 'express';

export class ExpressOAuth2<C extends OAuth2Client = any, T extends OAuth2Token = any> extends OAuth2<C, T, Request> {
    async getGrantTypeFromRequest(request: Request) {
        return request.body.grant_type;
    }

    async getAccessTokenFromRequest(request: Request) {
        return request.headers.authorization?.split(' ')[1];
    }

    async checkRequest(request: Request) {
        const expectedContentType = 'application/x-www-form-urlencoded';
        if (request.headers['content-type'] !== expectedContentType) {
            throw new InvalidRequestError(`The request must be sent using the ${expectedContentType} format`);
        }
    }

    tokenMiddleware() {
        return (req: Request, res: Response) => {
            this.token(req)
                .then((oauth2Response) => res.json(oauth2Response))
                .catch((e) => {
                    console.log(e);
                    res.set('Content-Type', 'application/json').status(e.statusCode).json(e);
                });
        };
    }
}
