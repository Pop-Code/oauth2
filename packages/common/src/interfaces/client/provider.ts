import { OAuth2ModelProvider } from '../provider';
import { OAuth2Client } from './model';

export interface OAuth2ClientProvider<C extends OAuth2Client> extends OAuth2ModelProvider<C> {
    findOneById: (id: string) => Promise<C | undefined>;
    findOneByIdAndSecret: (id: string, secret: string) => Promise<C | undefined>;
    save: (client: C) => Promise<void>;
}
