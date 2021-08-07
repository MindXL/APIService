import { FastifyInstance } from 'fastify';
import { AxiosInstance } from 'axios';
import cheerio, { Cheerio, Element } from 'cheerio';

import { ddnetEncode, parseRaceTime } from '../utils';

const uri = 'maps';

export const maps = (app: FastifyInstance, axios: AxiosInstance) => {
    app.get('/ddnet/maps/:map', async (request, reply) => {
        const map: string = (request.params as any).map;

        const response = await axios.get(`/maps/${ddnetEncode(map)}/`, {
            uri: uri,
            keyword: map,
        });
        const $ = cheerio.load(response.data);

        const globals = $('#global');
        const server = globals.eq(0).find('h2').text().split(' ')[0];

        const main = globals.eq(1);
        const [title, mapper] =
            main
                .find('h2')
                .text()
                .match(/(.*) by (.*)/)
                ?.slice(1, 3) ?? [];

        const info = main.find('.block2.info p').eq(0);

        const linebreak = info.find('br').get(0);
        const releaseDate =
            linebreak.previousSibling?.data?.match(/Released: ([\d-]+)/)?.[1] ??
            'legacy';
        const [stars, points] =
            (linebreak.nextSibling?.data ?? linebreak.previousSibling?.data)
                ?.match(/Difficulty: ([★✰]{5}), Points: (\d+)/)
                ?.slice(1, 3) ?? [];
        const difficulty = stars.replace(/✰/g, '').length;

        const tiles =
            info
                .find('span a img')
                .toArray()
                .map(
                    img =>
                        $(img)
                            .attr('src')
                            ?.match(/\/tiles\/(\w+).\w+/)?.[1]
                ) ?? [];

        const finishInfo = info.find('span').last();
        const [firstFinish, lastFinish, totalFinishes] =
            finishInfo
                .attr('title')
                ?.match(
                    /first finish: (\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}), last finish: (\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}), total finishes: (\d+)/
                )
                ?.slice(1, 4) ?? [];
        const [finishes, medianTime] =
            finishInfo
                .text()
                .match(/(\d+) tees finished \(median time: ([\d:]+)\)/)
                ?.slice(1, 3) ?? [];
        const [teamFinishes, biggestTeam] =
            (info.find('br').get(-1).nextSibling?.data ?? '')
                .match(/(\d+) teams finished \(biggest team: (\d+)\)/)
                ?.slice(1, 3) ?? [];

        const parseRecordsTable = (table: Cheerio<Element>) =>
            table
                .find('tr')
                .toArray()
                .map(tr => {
                    const players = $('a', tr)
                        .toArray()
                        .map(a => $(a).text());

                    return players.length > 1
                        ? {
                              rank: parseInt($('.rank', tr).text()),
                              players,
                              time: parseRaceTime($('.time', tr).text()),
                              server: $('img', tr).attr('alt'),
                          }
                        : {
                              rank: parseInt($('.rank', tr).text()),
                              player: players[0],
                              time: parseRaceTime($('.time', tr).text()),
                              server: $('img', tr).attr('alt'),
                          };
                });

        return reply.send({
            server: server,
            title: title,
            mapper: mapper,
            releaseDate: releaseDate,
            stars: stars,
            points: parseInt(points),
            difficulty: difficulty,
            tiles: tiles,
            firstFinish: Date.parse(firstFinish),
            lastFinish: Date.parse(lastFinish),
            totalFinishes: parseInt(totalFinishes),
            finishes: parseInt(finishes),
            medianTime: parseRaceTime(medianTime),
            teamFinishes: parseInt(teamFinishes),
            biggestTeam: parseInt(biggestTeam),
            teamRecords: parseRecordsTable($('.block2.teamrecords table')),
            records: parseRecordsTable($('.block2.records table')),
        });
    });
};
