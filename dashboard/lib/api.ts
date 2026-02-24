export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://openmemory:8080'

export const getHeaders = () => {
    const apiKey = process.env.NEXT_PUBLIC_API_KEY
    return {
        'Content-Type': 'application/json',
        ...(apiKey && { 'x-api-key': apiKey }),
    }
}
