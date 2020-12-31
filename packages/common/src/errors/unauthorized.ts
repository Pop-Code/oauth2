import { classToPlain } from 'class-transformer';

export class UnauthorizedError extends Error {
    public readonly statusCode = 401;
    constructor(message: string = 'Unauthorized') {
        super(message);
        Object.defineProperty(this, 'message', { enumerable: true });
    }

    toJSON() {
        return classToPlain(this);
    }
}
