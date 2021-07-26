import { FastifyInstance } from 'fastify';
import { AxiosInstance } from 'axios';

import { players } from './players';
import { cache } from './cache';

export const ddnet = (app: FastifyInstance, axios: AxiosInstance) => {
    cache(axios);

    players(app, axios);
};
