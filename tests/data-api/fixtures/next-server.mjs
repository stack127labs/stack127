// Use Next's own listener, routing and shutdown path, without a custom server.
import {startServer} from 'next/dist/server/lib/start-server.js';
process.env.__NEXT_DEV_SERVER = '1';
await startServer({dir: process.cwd(), isDev: true, port: 0, hostname: '127.0.0.1'});
process.send({port: Number(process.env.PORT)});
