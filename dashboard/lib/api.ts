export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://172.16.10.140:8080'

export const getHeaders = () => {
    const apiKey = '7pCxz4TIdh2BPHpKegfSCzpsBiDjSCFE'
    return {
        'Content-Type': 'application/json',
        ...(apiKey && { 'x-api-key': apiKey }),
    }
}
