import pm2, { StartOptions } from 'pm2';
import { splitHostAndPort }  from './utils';
import { env }               from './env';

const mode = env.isProd ? 'production' : 'development';

const MACHINE_NAME = process.env.KEYMETRICS_MACHINE_NAME;
const PRIVATE_KEY = process.env.KEYMETRICS_SECRET_KEY;
const PUBLIC_KEY = process.env.KEYMETRICS_PUBLIC_KEY;
const [HOST, PORT] = splitHostAndPort(env.SERVICES_ENDPOINT);
const APPNAME = process.env.PM2_APP_NAME || 'EMarket';
const isProd = env.isProd;
const instances = env.WEB_CONCURRENCY;
const maxMemory = env.WEB_MEMORY;
const processName = 'MarketApi'

const startOptions: StartOptions = {
	script:             './build/src/main.js',
	name:               processName,
	exec_mode:          'fork',
	instances:          instances,
	max_memory_restart: maxMemory + 'M',
	watch:              env.isDev,
	env:                {
		NODE_ENV:                isProd ? 'production' : 'development',
		APP_NAME:                APPNAME,
		PORT:                    PORT.toString() || "5500",
		HOST:                    HOST || "http://localhost",
		KEYMETRICS_PM2_APP_NAME: APPNAME,
		KEYMETRICS_MACHINE_NAME: MACHINE_NAME,
		KEYMETRICS_PUBLIC:       PUBLIC_KEY,
		KEYMETRICS_SECRET:       PRIVATE_KEY,
	},
};

pm2.connect(() =>
            {
	            pm2.start(startOptions,
	                      () =>
	                      {
		                      pm2.launchBus(function(err, bus)
		                                    {
			                                    console.log('Running in \'%s\' mode', mode)
			                                    console.log('[PM2] Log streaming started');
			
			                                    bus.on('log:out', function(packet)
			                                    {
				                                    console.log('[App:%s] %s', packet.process.name, packet.data);
			                                    });
			
			                                    bus.on('log:err', (packet) =>
			                                    {
				                                    console.error('[App:%s][Err] %s', packet.process.name, packet.data);
			                                    });
			
		                                    }
		                      );
	                      }
	            );
            }
);
