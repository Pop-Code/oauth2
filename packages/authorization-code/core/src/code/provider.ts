import { OAuth2ModelProvider } from '@pop-code/oauth2-common';

import { OAuth2AuthorizationCode } from './model';

export interface OAuth2CodeProvider<C extends OAuth2AuthorizationCode> extends OAuth2ModelProvider<C> {
    findOneByCode: (code: string) => Promise<C | undefined>;
    save: (code: C) => Promise<void>;
}
