import { GrantType } from '../../constants';

export interface OAuth2Request {
    grantType: GrantType | string;
    validate: () => Promise<void>;
    getInitialRequest: <R>() => Promise<R>;
    getBasicAuthorizationHeader?: () => string | undefined;
}
