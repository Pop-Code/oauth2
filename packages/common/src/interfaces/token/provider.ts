import { OAuth2ModelProvider } from '../provider';
import { OAuth2Token } from './model';

export interface OAuth2TokenProvider<T extends OAuth2Token> extends OAuth2ModelProvider<T> {
    findOneByAcessToken: (accessToken: string) => Promise<T | undefined>;
    save: (token: T) => Promise<void>;
}
