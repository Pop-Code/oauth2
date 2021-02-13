import { OAuth2ModelProvider } from '@pop-code/oauth2-common';

import { OAuth2ResourceOwner } from './model';

export interface OAuth2ResourceOwnerProvider<U extends OAuth2ResourceOwner> extends OAuth2ModelProvider<U> {
    findOneById: (id: string) => Promise<U | undefined>;
}
