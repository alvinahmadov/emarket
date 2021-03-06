require('dotenv').config();
import pm2, { StartOptions } from 'pm2';

import { env } from './scripts/env';

const MACHINE_NAME = process.env.KEYMETRICS_MACHINE_NAME;
const PRIVATE_KEY = process.env.KEYMETRICS_SECRET_KEY;
const PUBLIC_KEY = process.env.KEYMETRICS_PUBLIC_KEY;
const appName = process.env.PM2_APP_NAME || 'ShopWeb';
const instances = env.WEB_CONCURRENCY;
const maxMemory = env.WEB_MEMORY;
const host = env.HOST;
const port = env.PORT.toString();

const startOptions: StartOptions = {
	script: './dist/out-tsc/packages/shop-web-angular/app.js',
	name: appName,
	exec_mode: 'fork',
	instances,
	max_memory_restart: maxMemory + 'M',
	env: {
		// If needed declare some environment variables
		NODE_ENV: 'production',
		HOST: host,
		PORT: port,
		KEYMETRICS_MACHINE_NAME: MACHINE_NAME,
		KEYMETRICS_PUBLIC: PUBLIC_KEY,
		KEYMETRICS_SECRET: PRIVATE_KEY,
	},
}

pm2.connect(function()
            {
	            pm2.start(
			            startOptions,
			            () =>
			            {
				            pm2.dump(console.error);
				            // Display logs in standard output
				            pm2.launchBus(function(err, bus)
				                          {
					                          console.log('[PM2] Log streaming started');
					
					                          bus.on('log:out', function(packet)
					                          {
						                          console.log(
								                          '[App:%s] %s',
								                          packet.process.name,
								                          packet.data
						                          );
					                          });
					
					                          bus.on('log:err', function(packet)
					                          {
						                          console.error(
								                          '[App:%s][Err] %s',
								                          packet.process.name,
								                          packet.data
						                          );
					                          });
				                          });
			            }
	            );
            });
