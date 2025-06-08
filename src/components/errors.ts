export abstract class BaseException extends Error {
    static baseHeaders = {
        "Content-Type": "application/json;charset=utf-8",
        "Cache-Control": "no-store",
    }
    abstract readonly status: number;
    abstract readonly statusText: string;

    static JsonFormat(err: Error) {
        return {
            "name": err.constructor.name,
            "msg": err.message,
            "stack": err.stack,
        }
    }

    static UnknownError(err: Error): Response {
        return Response.json(
            BaseException.JsonFormat(err),
            {
                status: 500,
                statusText: "Internal Server Error",
                headers: BaseException.baseHeaders,
            },
        )
    }

    toResponse(): Response {
        return Response.json(
            BaseException.JsonFormat(this),
            {
                status: this.status,
                statusText: this.statusText,
                headers: BaseException.baseHeaders,
            },
        )
    }
}

export class BadRequestException extends BaseException {
    readonly status: number = 400;
    readonly statusText: string = "Bad Request";
}

export class NotFoundException extends BaseException {
    readonly status: number = 400;
    readonly statusText: string = "Not Found";
}

export class CloudflareApiException extends BaseException {
    readonly status: number = 500;
    readonly statusText: string = "Internal Server Error";
}