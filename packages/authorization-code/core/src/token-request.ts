import {
    decodeOAuth2ClientBacicToken,
    GrantType,
    InvalidRequestError,
    OAuth2ClientCredentials,
    OAuth2Request,
} from '@pop-code/oauth2-common';
import { Equals, IsDefined, isEmpty, IsOptional, IsString, MinLength, validate, ValidateIf } from 'class-validator';

/**
 * OAuth2 Access Token Request
 * @see https://tools.ietf.org/html/rfc6749#section-4.1.3
 */
export abstract class OAuth2AuthorizationCodeTokenRequest implements OAuth2Request {
    @Equals('authorization_code')
    readonly grantType = GrantType.AUTHORIZATION_CODE;

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
    @MinLength(1)
    @IsOptional()
    redirect_uri?: string;

    @IsString()
    @MinLength(1)
    code: string;

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
        if (this.client_id === undefined) {
            return;
        }
        return { clientId: this.client_id };
    }
}
