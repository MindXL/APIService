import axios from 'axios';
import { fastify } from 'fastify';

import { ddnet } from './ddnet';

require('dotenv').config('../.env');

const app = fastify({ logger: false });

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
        const PORT = process.env.PORT!;
        await app.listen(PORT);

        const info = `server listening on localhost:${PORT}`;
        app.log.info(info);
        console.info(info);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};
start();
