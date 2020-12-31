import { OAuth2Client } from './client';
import { OAuth2Token } from './token';

export interface OAuth2ModelProvider<M extends OAuth2Token | OAuth2Client> {
    getClass: () => new (...args: any[]) => M;
}
