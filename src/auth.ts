import {Buffer} from "buffer";
import {BadRequestException} from "./errors";

export function parseBasicAuth(request: Request) {
    const Authorization = request.headers.get("Authorization") || "";
    const [_, data] = Authorization.split(" ");
    const decoded = Buffer.from(data, 'base64').toString('ascii');
    const index = decoded.indexOf(":");

    if (index === -1 || /[\0-\x1F\x7F]/.test(decoded)) {
        throw new BadRequestException("Invalid authorization value.");
    }

    return {
        username: decoded.substring(0, index),
        password: decoded.substring(index + 1),
    };
}