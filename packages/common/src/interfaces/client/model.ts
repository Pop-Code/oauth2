import { GrantType } from '../../constants';

export interface OAuth2Client {
    getId: () => string;
    getSecret: () => string;
    getSupportedGrantTypes: () => Array<GrantType | string>;
    getSupportedScopes: () => string[];
    getSupportedRedirectUris?: () => string[];
}
