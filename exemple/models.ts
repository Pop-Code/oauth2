import { GrantType, OAuth2Client, OAuth2ClientProvider, OAuth2Token, OAuth2TokenProvider } from '@pop-code/oauth2-common';

export class StorageTest<T = any> {
    private readonly items = new Set<T>();

    findOne(predicate: (item: T) => boolean) {
        return Array.from(this.items.values()).find(predicate);
    }

    save(item: T) {
        this.items.add(item);
    }

    delete(item: T) {
        this.items.delete(item);
    }
}

export class OAuth2ClientTest implements OAuth2Client {
    getId() {
        return 'test';
    }

    getSecret() {
        return 'test';
    }

    getSupportedGrantTypes() {
        return [GrantType.CLIENT_CREDENTIALS];
    }

    getSupportedScopes() {
        return ['scope1', 'scope2', 'scope3'];
    }
}

export class OAuth2ClientTestProvider implements OAuth2ClientProvider<OAuth2ClientTest> {
    private readonly db: StorageTest<OAuth2ClientTest>;
    constructor() {
        this.db = new StorageTest<OAuth2ClientTest>();
    }

    getClass() {
        return OAuth2ClientTest;
    }

    async findOneById(id: string) {
        return this.db.findOne((c) => id === c.getId());
    }

    async findOneByIdAndSecret(id: string, secret: string) {
        return this.db.findOne((c) => id === c.getId() && secret === c.getSecret());
    }

    async save(client: OAuth2ClientTest) {
        return this.db.save(client);
    }
}

export class OAuth2TokenTest implements OAuth2Token {
    clientId: string;
    access_token: string;
    expires_in?: number;
    scope?: string;

    getType() {
        return 'bearer';
    }

    getExpiresIn() {
        return this.expires_in;
    }

    getAccessToken() {
        return this.access_token;
    }

    getScope() {
        return this.scope;
    }

    getClientId() {
        return this.clientId;
    }
}

export class OAuth2TokenTestProvider implements OAuth2TokenProvider<OAuth2TokenTest> {
    private readonly db: StorageTest<OAuth2TokenTest>;
    constructor() {
        this.db = new StorageTest<OAuth2TokenTest>();
    }

    getClass() {
        return OAuth2TokenTest;
    }

    async findOneByAcessToken(accessToken: string) {
        return this.db.findOne((t) => {
            return accessToken === t.getAccessToken();
        });
    }

    async save(token: OAuth2TokenTest) {
        return this.db.save(token);
    }
}
