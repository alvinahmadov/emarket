// NOTE: do NOT ever put here any secure settings! (e.g. Secret Keys)
// We are using dotenv (.env) for consistency with other Platform projects
// This is Angular app and all settings will be loaded into the client browser!

import { cleanEnv, num, str, bool } from 'envalid';

export type Env = Readonly<{
	production: boolean;
	
	DEFAULT_LANGUAGE: string;
	
	SERVICES_ENDPOINT: string;
	HTTPS_SERVICES_ENDPOINT: string;
	SERVER_URL: string;
	WEB_CONCURRENCY: number;
	WEB_MEMORY: number;
	HOST: string;
	PORT: number;
}>;

export const env: Env = cleanEnv(
		process.env,
		{
			production: bool({ default: false }),
			
			DEFAULT_LANGUAGE: str({ default: 'ru-RU' }),
			
			SERVICES_ENDPOINT: str({ default: 'http://localhost:5500' }),
			HTTPS_SERVICES_ENDPOINT: str({ default: 'https://localhost:5501' }),
			SERVER_URL: str({ default: 'http://localhost:9595' }),
			WEB_CONCURRENCY: num({ default: 1 }),
			WEB_MEMORY: num({ default: 2048 }),
			HOST: str({ default: 'localhost' }),
			PORT: num({ default: 4205 }),
		},
		{ strict: true, dotEnvPath: __dirname + '/../.env' }
);
