import util                        from 'util';
import pm2, { Proc, StartOptions } from 'pm2';
import csts                        from 'pm2/constants.js';
import { createLogger }            from './helpers/Log';
import { env }                     from './env';

const mode = env.isProd ? 'production' : 'development';

const log = createLogger({ name: 'PM2' });

const MACHINE_NAME = process.env.KEYMETRICS_MACHINE_NAME;
const PRIVATE_KEY = process.env.KEYMETRICS_SECRET_KEY;
const PUBLIC_KEY = process.env.KEYMETRICS_PUBLIC_KEY;
const PORT = process.env.HTTPPORT || '5500';
const appName = process.env.PM2_APP_NAME || 'Admin';
const isProd = env.isProd;
const instances = env.WEB_CONCURRENCY;
const maxMemory = env.WEB_MEMORY;

const processName = 'MarketApi'
const timeout = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const runningApps = util.promisify(pm2.list.bind(pm2));

pm2.connect(
		function()
		{
			const startOptions: StartOptions = {
				script: './build/src/main.js',
				name: processName,
				exec_mode: 'fork',
				instances: instances,
				max_memory_restart: maxMemory + 'M',
				watch: env.isDev,
				env: {
					NODE_ENV: isProd ? 'production' : 'development',
					PORT: PORT,
					KEYMETRICS_PUBLIC: PUBLIC_KEY,
					KEYMETRICS_SECRET: PRIVATE_KEY,
				},
			};
			
			pm2.start(startOptions,
			          (err: Error, proc: Proc) =>
			          {
				          pm2.dump(console.error);
				
				          pm2.launchBus(function(err, bus)
				                        {
					                        console.log('Start in `%s` mode', mode)
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

function exitPM2()
{
	console.log('Exiting PM2');
	pm2.killDaemon((err, procDesc) =>
	               {
		               console.error(err);
		               process.exit(0)
	               });
	pm2.disconnect();
}

/**
 * Exit current PM2 instance if 0 app is online
 */
async function autoExit()
{
	const interval = 3000;
	const aliveInterval = interval * 1.5;
	
	let alive = false;
	
	while(true)
	{
		await timeout(interval);
		
		const aliveTimer = setTimeout(() =>
		                              {
			                              if(!alive)
			                              {
				                              log.error('PM2 Daemon is dead');
				                              process.exit(1);
			                              }
		                              }, aliveInterval);
		
		try
		{
			pm2.list((err, apps) =>
			         {
				         clearTimeout(aliveTimer);
				         alive = true;
				
				         let appOnline = 0;
				
				         apps.forEach((app) =>
				                      {
					                      if(
							                      app.pm2_env.status === csts.ONLINE_STATUS ||
							                      app.pm2_env.status === csts.LAUNCHING_STATUS
					                      )
					                      {
						                      appOnline++;
					                      }
				                      });
				
				         if(appOnline === 0)
				         {
					         console.log('0 application online, exiting');
					         exitPM2();
				         }
			         });
		} catch(err)
		{
			log.error('pm2.list got error');
			log.error(err);
			exitPM2();
			return;
		}
	}
}
