import { classToPlain } from 'class-transformer';
import { ValidationError } from 'class-validator';

export class OAuth2Error extends Error {
    constructor(
        public readonly error: string,
        public readonly error_description?: string,
        public readonly error_uri?: string,
        public readonly statusCode = 400,
        public readonly validationErrors?: ValidationError[]
    ) {
        super(error);
    }

    toJSON() {
        return classToPlain(this);
    }
}
