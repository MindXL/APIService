import { FastifyInstance } from 'fastify';
import { AxiosInstance, AxiosError } from 'axios';

export const players = (app: FastifyInstance, axios: AxiosInstance) => {
    app.get('/ddnet/players/:player', async (request, reply) => {
        const player: string = (request.params as any).player;

        try {
            const response = await axios.get(`/players`, {
                params: {
                    json2: player,
                },
            });

            if (!response.data.player) {
                return reply.status(404).send({ error: 'Player not found' });
            }
            return reply.send(response.data);
        } catch (e) {
            const err = e as AxiosError;
            return reply
                .status(err?.response?.status || 500)
                .send({ error: 'Internal Server Error' });
        }
    });
};
