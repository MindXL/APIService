import axios from 'axios';
import { fastify } from 'fastify';

import { ddnet } from './ddnet';

const app = fastify({ logger: false });

declare module 'axios' {
    interface AxiosRequestConfig {
        cache?: boolean;
    }
}

const ddnetAxios = axios.create({
    baseURL: 'https://ddnet.tw',
    headers: {
        'Accept-Encoding': 'gzip, deflate',
    },
    timeout: 10000,
    timeoutErrorMessage: 'Timeout Exceeded',
    decompress: true,
    cache: true,
});

ddnet(app, ddnetAxios);

// app.listen(3000, function (err, address) {
//     if (err) {
//         app.log.error(err);
//         process.exit(1);
//     }
//     app.log.info(`server listening on ${address}`);
//     console.info(`server listening on ${address}`);
// });

const start = async () => {
    try {
        await app.listen(3000);

        app.log.info(`server listening on localhost:3000`);
        console.info(`server listening on localhost:3000`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};
start();
