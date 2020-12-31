import {
    decodeOAuth2ClientBacicToken,
    GrantType,
    InvalidRequestError,
    OAuth2ClientCredentials,
    OAuth2TokenRequest,
} from '@pop-code/oauth2-common';
import { Equals, IsDefined, isEmpty, IsOptional, IsString, MinLength, validate, ValidateIf } from 'class-validator';

export abstract class OAuth2ClientCredentialsRequest implements OAuth2TokenRequest {
    @Equals(GrantType.CLIENT_CREDENTIALS)
    readonly grantType = GrantType.CLIENT_CREDENTIALS;

    @IsDefined()
    protected readonly request: any;

    @IsString()
    @MinLength(1)
    @IsOptional()
    client_id?: string;

    @IsString()
    @MinLength(1)
    @ValidateIf((o) => !isEmpty(o.client_id))
    client_secret?: string;

    @IsString()
    @IsOptional()
    scope?: string;

    constructor(request: any) {
        this.request = request;
    }

    async getInitialRequest<R>(): Promise<R> {
        return this.request;
    }

    checkRequestContentType(contentType: string) {
        const expectedContentType = 'application/x-www-form-urlencoded';
        if (contentType !== expectedContentType) {
            throw new InvalidRequestError(`The request must be sent using the ${expectedContentType} format`);
        }
    }

    async validate() {
        const errors = await validate(this, { whitelist: true, validationError: { target: false, value: false } });
        if (errors.length > 0) {
            throw new InvalidRequestError(undefined, undefined, errors);
        }
    }

    abstract getBasicAuthorizationHeader(): string | undefined;

    getClientCredentials(): OAuth2ClientCredentials | undefined {
        const basicAuth = this.getBasicAuthorizationHeader();
        if (typeof basicAuth === 'string') {
            return decodeOAuth2ClientBacicToken(basicAuth);
        }
        if (this.client_id === undefined || this.client_secret === undefined) {
            return;
        }
        return { clientId: this.client_id, clientSecret: this.client_secret };
    }
}
