// NOTE: do NOT ever put here any secure settings! (e.g. Secret Keys)
// We are using dotenv (.env) for consistency with other Platform projects
// This is Angular app and all settings will be loaded into the client browser!

import { cleanEnv, num, str, bool } from 'envalid';

export type Env = Readonly<{
	production: boolean;
	
	HTTPS_SERVICES_ENDPOINT: string;
	HTTP_SERVICES_ENDPOINT: string;
	GQL_ENDPOINT: string;
	GQL_SUBSCRIPTIONS_ENDPOINT: string;
	
	WEB_CONCURRENCY: number;
	WEB_MEMORY: number;
	
	HOST: string;
	PORT: number;
}>;

export const env: Env = cleanEnv(
		process.env,
		{
			production: bool({ default: false }),
			
			HTTPS_SERVICES_ENDPOINT:    str({ default: 'https://localhost:5501' }),
			HTTP_SERVICES_ENDPOINT:     str({ default: 'http://localhost:5500' }),
			GQL_ENDPOINT:               str({ default: 'http://localhost:5555/graphql' }),
			GQL_SUBSCRIPTIONS_ENDPOINT: str({ default: 'ws://localhost:5050/subscriptions' }),
			
			WEB_CONCURRENCY: num({ default: 1 }),
			WEB_MEMORY:      num({ default: 2048 }),
			
			HOST: str({ default: 'localhost' }),
			PORT: num({ default: 4205 }),
		},
		{ strict: true, dotEnvPath: __dirname + '/../.env' }
);
