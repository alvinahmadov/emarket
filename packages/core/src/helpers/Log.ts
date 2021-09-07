import Logger         from 'bunyan';
import createCWStream from 'bunyan-cloudwatch';
import PrettyStream   from 'bunyan-prettystream';
import { existsSync } from 'fs';
import _              from 'lodash';
import mkdirp         from 'mkdirp';
import os             from 'os';
import { env }        from '../env';

export interface LogArgs
{
	// which file used to store logs
	name: string;
	ns?: string;
}

let isLogsFolderExists = env.LOGS_PATH ? existsSync(env.LOGS_PATH) : false;

const getAdditionalLoggerStreams = ({ name }: LogArgs): Logger.Stream[] =>
{
	const hostname = os.hostname();
	const awsDeploy = env.AWS_ACCESS_KEY_ID.length > 0 && env.AWS_SECRET_ACCESS_KEY.length > 0;
	
	if(env.isProd && awsDeploy)
	{
		const logLevels: Logger.LogLevel[] = ['info', 'error', 'debug'];
		
		return _.map(logLevels, (type) =>
		{
			let stream: any;
			
			try
			{
				stream = createCWStream({
					                        logGroupName:          'ever/api',
					                        logStreamName:         `${type}_${name}_${hostname}`,
					                        cloudWatchLogsOptions: {
						                        region: 'us-east-1'
					                        }
				                        });
			} catch(err)
			{
				console.log(err);
			}
			
			return {
				stream,
				type:  'raw',
				level: type
			};
		});
	}
	else
	{
		return [];
	}
};

const prettyStdOut = new PrettyStream();

prettyStdOut.pipe(process.stdout);

export function createLogger({ name, ns = 'emarket' }: LogArgs): Logger
{
	if(!isLogsFolderExists)
	{
		mkdirp.sync(env.LOGS_PATH);
		isLogsFolderExists = true;
	}
	
	const logger = Logger.createLogger({
		                                   name:        `${ns}.${name}`,
		                                   serializers: Logger.stdSerializers,
		                                   streams:     [
			                                   {
				                                   level: 'info',
				                                   path:  `${env.LOGS_PATH}/info_${name}.log`
			                                   },
			                                   {
				                                   level: 'error',
				                                   path:  `${env.LOGS_PATH}/error_${name}.log`
			                                   },
			                                   {
				                                   level: 'debug',
				                                   path:  `${env.LOGS_PATH}/debug_${name}.log`
			                                   },
			                                   {
				                                   level:  'debug',
				                                   type:   'raw',
				                                   stream: prettyStdOut
			                                   },
			                                   ...getAdditionalLoggerStreams({ name })
		                                   ]
	                                   });
	
	if(env.LOG_LEVEL)
	{
		logger.level(Logger[env.LOG_LEVEL.toUpperCase()]);
	}
	
	return logger;
}

export function Log(logArgs: LogArgs): ClassDecorator
{
	return function(target)
	{
		target.prototype.logName = logArgs.name;
		target.prototype.log = createLogger(logArgs);
	};
}
