import { GrantType, InvalidRequestError, OAuth2Request } from '@pop-code/oauth2-common';
import { Equals, IsDefined, IsOptional, IsString, MinLength, validate } from 'class-validator';

/**
 * OAuth2 Authorization Code Request
 * @see https://tools.ietf.org/html/rfc6749#section-4.1.1
 */
export abstract class OAuth2AuthorizationCodeRequest implements OAuth2Request {
    @Equals('authorization_code')
    readonly grantType = GrantType.AUTHORIZATION_CODE;

    @IsDefined()
    protected readonly request: any;

    @Equals('code')
    response_type: string = 'code';

    @IsString()
    @MinLength(1)
    client_id: string;

    @IsString()
    @MinLength(1)
    @IsOptional()
    scope?: string;

    @IsString()
    @MinLength(1)
    @IsOptional()
    redirect_uri?: string;

    @IsString()
    @MinLength(1)
    @IsOptional()
    state?: string;

    constructor(request: any) {
        this.request = request;
    }

    async getInitialRequest<R>(): Promise<R> {
        return this.request;
    }

    async validate() {
        const errors = await validate(this, { whitelist: true, validationError: { target: false, value: false } });
        if (errors.length > 0) {
            throw new InvalidRequestError(undefined, undefined, errors);
        }
    }
}
