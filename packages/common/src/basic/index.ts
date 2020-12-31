import { isBase64 } from 'class-validator';

import { InvalidRequestError } from '../errors';
import { OAuth2ClientCredentials } from '../interfaces';

export const createOAuth2ClientBacicToken = (credentials: OAuth2ClientCredentials) =>
    encodeURIComponent(credentials.clientId) + ':' + encodeURIComponent(credentials.clientSecret);

export const decodeOAuth2ClientBacicToken = (authorizationHeader: string): OAuth2ClientCredentials => {
    const authParts = authorizationHeader.split(' ');
    if (authParts.length < 2 || authParts[0] !== 'Basic' || !isBase64(authParts[1])) {
        throw new InvalidRequestError('Basic authorization header is malformed');
    }
    const [clientId, clientSecret] = Buffer.from(authParts[1], 'base64')
        .toString('utf8')
        .split(':')
        .map(decodeURIComponent);
    return { clientId, clientSecret };
};
