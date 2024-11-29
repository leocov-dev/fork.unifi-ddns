interface CloudflareOptions {
    token: string
}

interface CloudflareRecord {
    id: string
    zone_id: string
    name: string
    type: string
    proxied: boolean
    content: string
    ttl?: number
    comment?: string
}

interface CloudflareResponse {
    success: boolean
    result: Array<CloudflareRecord>
}