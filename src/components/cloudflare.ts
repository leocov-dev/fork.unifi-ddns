import {CloudflareApiException, NotFoundException} from "./errors";
import {name, version} from "./../../package.json"

export class Cloudflare {
    private cloudflare_url: string = "https://api.cloudflare.com/client/v4";
    private readonly token: string;

    constructor(options: CloudflareOptions) {
        this.token = options.token;
    }

    async findZone(name: string): Promise<CloudflareRecord> {
        const response = await this._fetchWithToken(`zones?name=${name}`);
        const body = await response.json<CloudflareResponse>();

        if (!body.success || body.result.length === 0) {
            throw new NotFoundException(`Failed to find zone '${name}'`);
        }

        return body.result[0];
    }

    async findRecord(zone: CloudflareRecord, name: string): Promise<CloudflareRecord> {
        const response = await this._fetchWithToken(`zones/${zone.id}/dns_records?name=${name}`);
        const body = await response.json<CloudflareResponse>();

        if (!body.success || body.result.length === 0) {
            throw new NotFoundException(`Failed to find dns record '${name}'`);
        }

        return body.result[0];
    }

    async updateRecord(record: CloudflareRecord, targetIp: string): Promise<CloudflareRecord> {
        /**
         * https://developers.cloudflare.com/api/operations/dns-records-for-a-zone-update-dns-record
         */
        record.content = targetIp;
        record.comment = `${name}<${version}> ${new Date().toISOString()}`;

        console.log(`updating record: ${JSON.stringify(record)}`);

        const response = await this._fetchWithToken(
            `zones/${record.zone_id}/dns_records/${record.id}`,
            {
                method: "PUT",
                body: JSON.stringify(record),
            },
        );

        const body = await response.json<CloudflareResponse>();

        if (!body.success) {
            throw new CloudflareApiException("Failed to update dns record");
        }

        return body.result[0];
    }

    private async _fetchWithToken(endpoint: string, options: RequestInit = {}): Promise<Response> {
        options.headers = {
            ...options.headers,
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.token}`,
        };

        return fetch(`${this.cloudflare_url}/${endpoint}`, options);
    }
}