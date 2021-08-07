import { FastifyInstance } from 'fastify';
import { AxiosInstance } from 'axios';

import { cache } from './cache';
import { players } from './players';
import { maps } from './maps';

export const ddnet = (app: FastifyInstance, axios: AxiosInstance) => {
    cache(axios);

    players(app, axios);
    maps(app, axios);
};
