import {BaseException} from "./errors";
import {handler} from "./handler";


export default {
    async fetch(request: Request): Promise<Response> {
        return handler(request).catch((err): Response => {
            console.error(err.constructor.name, err);

            if (err instanceof BaseException) {
                return err.toResponse();
            } else {
                return BaseException.UnknownError(err);
            }
        });
    },
};
