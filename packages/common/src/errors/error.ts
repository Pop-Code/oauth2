/* eslint-disable @typescript-eslint/naming-convention */
import { classToPlain, Exclude, Expose } from 'class-transformer';
import { isEmpty, ValidationError } from 'class-validator';

export class OAuth2Error extends Error {
    @Expose({ name: 'error_description' })
    public readonly errorDescription?: string;

    @Expose({ name: 'error_uri' })
    public readonly errorUri?: string;

    @Exclude()
    public readonly statusCode: number;

    public readonly validationErrors?: ValidationError[];

    constructor(
        public readonly error: string,
        errorDescription?: string,
        errorUri?: string,
        statusCode = 400,
        validationErrors?: ValidationError[]
    ) {
        super(error);
        if (!isEmpty(errorDescription)) {
            this.errorDescription = errorDescription;
        }
        if (!isEmpty(errorUri)) {
            this.errorUri = errorUri;
        }
        if (!isEmpty(validationErrors)) {
            this.validationErrors = validationErrors;
        }
        this.statusCode = statusCode;
    }

    toJSON() {
        return classToPlain(this);
    }
}
