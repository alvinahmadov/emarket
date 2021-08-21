import connect     from 'connect';
import path        from 'path';
import serveStatic from 'serve-static';
import { env }     from './scripts/env';

const host: string = env.HOST;
const port: number = env.PORT;

connect()
		.use(serveStatic(path.join(__dirname, '../../../../www')))
		.listen(port, host);

console.log(`Listening on ${host}:${port}`);
