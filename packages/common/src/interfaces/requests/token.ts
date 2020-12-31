import { OAuth2Request } from './request';

export interface OAuth2TokenRequest extends OAuth2Request {
    client_id?: string;
    client_secret?: string;
    scope?: string;
}
