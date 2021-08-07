import {} from 'axios';
import {} from 'cheerio';

declare module 'axios' {
    interface AxiosRequestConfig {
        uri?: string;
        keyword?: string;
        cache?: boolean;
    }
}

declare module 'cheerio' {
    class Node {
        data: string | null;
    }
}
