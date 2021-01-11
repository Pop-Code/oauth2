import { OAuth2 } from '@pop-code/oauth2';
import { InvalidRequestError, OAuth2Client, OAuth2Error, OAuth2Token } from '@pop-code/oauth2-common';
import { FastifyReply, FastifyRequest } from 'fastify';

export class FastifyOAuth2<C extends OAuth2Client = any, T extends OAuth2Token = any> extends OAuth2<
    C,
    T,
    FastifyRequest
> {
    async getGrantTypeFromRequest(request: FastifyRequest) {
        return (request.body as any).grant_type;
    }

    async getAccessTokenFromRequest(request: FastifyRequest) {
        return request.headers.authorization?.split(' ')[1];
    }

    async checkRequest(request: FastifyRequest) {
        const expectedContentType = 'application/x-www-form-urlencoded';
        if (request.headers['content-type'] !== expectedContentType) {
            throw new InvalidRequestError(`The request must be sent using the ${expectedContentType} format`);
        }
    }

    tokenMiddleware() {
        return async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                return await this.token(request);
            } catch (e) {
                if (e instanceof OAuth2Error) {
                    return await reply.status(e.statusCode).send(e.toJSON());
                }
                throw e;
            }
        };
    }

    authenticateMiddleware() {
        return async (req: FastifyRequest & { oauth2?: any }, reply: FastifyReply) => {
            return await this.authenticate(req).then((client) => {
                req.oauth2 = { client };
            });
        };
    }
}
