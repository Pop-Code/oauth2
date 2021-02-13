import {
    OAuth2AuthorizationCode,
    OAuth2AuthorizationCodeToken,
    OAuth2CodeProvider,
    OAuth2ResourceOwner,
    OAuth2ResourceOwnerProvider,
} from '@pop-code/oauth2-authorization-code';
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
        return [GrantType.CLIENT_CREDENTIALS, GrantType.AUTHORIZATION_CODE];
    }

    getSupportedScopes() {
        return ['scope1', 'scope2', 'scope3'];
    }

    getSupportedRedirectUris() {
        return ['http://localhost:3000/signin'];
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

export class OAuth2TokenTest implements OAuth2Token, OAuth2AuthorizationCodeToken {
    clientId: string;
    accessToken: string;
    expiresIn?: number;
    scope?: string;
    resourceOwnerId: string;
    refreshToken: string;

    getType() {
        return 'bearer';
    }

    getExpiresIn() {
        return this.expiresIn;
    }

    getAccessToken() {
        return this.accessToken;
    }

    getScope() {
        return this.scope;
    }

    getClientId() {
        return this.clientId;
    }

    getResourceOwnerId() {
        return this.resourceOwnerId;
    }

    getRefreshToken() {
        return this.refreshToken;
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

export class OAuth2CodeTest implements OAuth2AuthorizationCode {
    expiresIn?: number;
    code: string;
    scope?: string;
    clientId: string;
    resourceOwnerId: string;
    redirectUri: string;

    getExpiresIn() {
        return this.expiresIn;
    }

    getCode() {
        return this.code;
    }

    getScope() {
        return this.scope;
    }

    getClientId() {
        return this.clientId;
    }

    getResourceOwnerId() {
        return this.resourceOwnerId;
    }

    getRedirectUri() {
        return this.redirectUri;
    }
}

export class OAuth2CodeTestProvider implements OAuth2CodeProvider<OAuth2CodeTest> {
    private readonly db: StorageTest<OAuth2CodeTest>;
    constructor() {
        this.db = new StorageTest<OAuth2CodeTest>();
    }

    getClass() {
        return OAuth2CodeTest;
    }

    async findOneByCode(code: string) {
        return this.db.findOne((c) => {
            return code === c.getCode();
        });
    }

    async save(code: OAuth2CodeTest) {
        return this.db.save(code);
    }
}

export class OAuth2ResourceOwnerTest implements OAuth2ResourceOwner {
    getId() {
        return 'resource-owner-test';
    }
}

export class OAuth2ResourceOwnerTestProvider implements OAuth2ResourceOwnerProvider<OAuth2ResourceOwnerTest> {
    private readonly db: StorageTest<OAuth2ResourceOwnerTest>;
    constructor() {
        this.db = new StorageTest<OAuth2ResourceOwnerTest>();
    }

    getClass() {
        return OAuth2ResourceOwnerTest;
    }

    async findOneById(id: string) {
        return this.db.findOne((r) => id === r.getId());
    }

    async save(item: OAuth2ResourceOwnerTest) {
        return this.db.save(item);
    }
}
