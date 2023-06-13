export class BadRequestException extends Error {
    private readonly status: number = 400;
    private readonly statusText: string = "Bad Request";
}

export class CloudflareApiException extends Error {
    private readonly status: number = 500;
    private readonly statusText: string = "Internal Server Error";
}