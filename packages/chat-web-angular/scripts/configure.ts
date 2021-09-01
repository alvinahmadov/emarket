// NOTE: do NOT ever put here any secure settings! (e.g. Secret Keys)
// We are using dotenv (.env) for consistency with other Platform projects
// This is Angular app and all settings will be loaded into the client browser!

import { env }                   from './env';
import { writeFile, unlinkSync } from 'fs';
// import { argv }                  from 'yargs';

// const environment = argv.environment;
const isProd = false; //environment === 'prod';

const envFileContentDev = `// NOTE: Auto-generated file
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses 'environment.ts', but if you do
// 'ng build --env=prod' then 'environment.prod.ts' will be used instead.
// The list of which env maps to which file can be found in '.angular-cli.json'.

import { ApplicationRef, NgModuleRef } from '@angular/core';
import { enableDebugTools } from '@angular/platform-browser';
import { Environment } from './model';

Error.stackTraceLimit = Infinity;

// tslint:disable-next-line:no-var-requires
require('zone.js/dist/long-stack-trace-zone');

export const environment: Environment = {
  production: ${isProd},

  SERVICES_ENDPOINT: '${env.SERVICES_ENDPOINT}',
  HTTPS_SERVICES_ENDPOINT: '${env.HTTPS_SERVICES_ENDPOINT}',
  SERVER_URL: '${env.SERVER_URL}',
  
  HOST: '${env.HOST}',
  PORT: ${env.PORT},

  DEFAULT_LANGUAGE: '${env.DEFAULT_LANGUAGE}',
  ENV_PROVIDERS: [],

  /**
	* Angular debug tools in the dev console
	* https://github.com/angular/angular/blob/86405345b781a9dc2438c0fbe3e9409245647019/TOOLS_JS.md
	* @param modRef
	* @return {any}
	*/
	decorateModuleRef(modRef: NgModuleRef<any>) {
		const appRef = modRef.injector.get(ApplicationRef);
		const cmpRef = appRef.components[0];

		const _ng = (window as any).ng;
		enableDebugTools(cmpRef);
		(window as any).ng.probe = _ng.probe;
		(window as any).ng.coreTokens = _ng.coreTokens;
		return modRef;
	}

};
`;

const envFileContentProd = `// NOTE: Auto-generated file
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses 'environment.ts', but if you do
// 'ng build --env=prod' then 'environment.prod.ts' will be used instead.
// The list of which env maps to which file can be found in '.angular-cli.json'.

import { enableProdMode, NgModuleRef } from '@angular/core';
import { disableDebugTools } from '@angular/platform-browser';
import { Environment } from './model';

enableProdMode();

export const environment: Environment = {
  production: ${isProd},

  SERVICES_ENDPOINT: '${env.SERVICES_ENDPOINT}',
  HTTPS_SERVICES_ENDPOINT: '${env.HTTPS_SERVICES_ENDPOINT}',
  SERVER_URL: '${env.SERVER_URL}',
  
  HOST: '${env.HOST}',
  PORT: ${env.PORT},

  DEFAULT_LANGUAGE: '${env.DEFAULT_LANGUAGE}',
  ENV_PROVIDERS: [],

  /**
	* Angular debug tools in the dev console
	* https://github.com/angular/angular/blob/86405345b781a9dc2438c0fbe3e9409245647019/TOOLS_JS.md
	* @param modRef
	* @return {any}
	*/
	decorateModuleRef(modRef: NgModuleRef<any>) {
		disableDebugTools();
		return modRef;
	}

};
`;

// we always want first to remove old generated files (one of them is not needed for current build)
try
{
	unlinkSync(`./src/environments/environment.ts`);
} catch(ex)
{
	console.error(ex.message);
}

try
{
	unlinkSync(`./src/environments/environment.prod.ts`);
} catch(ex)
{
	console.error(ex.message);
}

const envFileDest: string = isProd ? 'environment.prod.ts' : 'environment.ts';
const envFileDestOther: string = !isProd
                                 ? 'environment.prod.ts'
                                 : 'environment.ts';

writeFile(`./src/environments/${envFileDest}`, envFileContentProd, function(
		err
)
{
	if(err)
	{
		console.log(err);
	}
	else
	{
		console.log(`Generated Angular environment file: ${envFileDest}`);
	}
});

writeFile(
		`./src/environments/${envFileDestOther}`,
		envFileContentDev,
		function(err)
		{
			if(err)
			{
				console.log(err);
			}
			else
			{
				console.log(
						`Generated Angular environment file: ${envFileDestOther}`
				);
			}
		}
);
