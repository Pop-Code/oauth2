export interface OAuth2ModelProvider<M> {
    getClass: () => new (...args: any[]) => M;
}
