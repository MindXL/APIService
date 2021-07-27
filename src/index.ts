import { fastify } from 'fastify';

const app = fastify({ logger: false });

app.get('/', async (request, reply) => {
    return { hello: 'world' };
});

// app.listen(3000, (err, address) => {
//     if (err) {
//         console.error(err);
//         process.exit(1);
//     }
//     console.log(`app listening at ${address}`);
// });
const start = async () => {
    try {
        await app.listen(3000);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};
start();
