import { OAuth2Client } from './client';
import { OAuth2Grant } from './grant';
import { OAuth2Token } from './token';

export interface OAuth2Interface<C extends OAuth2Client, T extends OAuth2Token, R = any> {
    /**
     * Get an array of supported grant types
     */
    getGrants: () => Array<OAuth2Grant<C, T>>;

    /**
     * Get a grant by type
     */
    getGrant: <G extends OAuth2Grant<C, T>>(name: string) => G;

    /**
     * Add a grant
     */
    addGrant: <G extends OAuth2Grant<C, T>>(grant: G) => this;

    /**
     * Remove a grant
     */
    removeGrant: (name: string) => boolean;

    /**
     * Get a grant from the request
     * @throws InvalidRequestError if the grant type is not found
     */
    getGrantTypeFromRequest: (request: R) => Promise<string | undefined>;

    /**
     * Check the request
     */
    checkRequest: (request: R) => Promise<void>;
}
