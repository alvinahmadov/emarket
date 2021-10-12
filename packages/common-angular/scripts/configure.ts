// NOTE: do NOT ever put here any secure settings! (e.g. Secret Keys)
// We are using dotenv (.env) for consistency with other Platform projects
// This is Angular app and all settings will be loaded into the client browser!

import { env }                   from './env';
import { writeFile, unlinkSync } from 'fs';
import { argv }                  from 'yargs';

const environment = argv.environment;
const isProd = environment === 'prod';

let mode = 'development';

if(isProd)
{
	mode = 'production';
}

console.info(`Configuring in ${mode} mode`)

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
  production:               ${isProd},

  LOG_LEVEL:                "${env.LOG_LEVEL}",

  DEFAULT_LANGUAGE:         "${env.DEFAULT_LANGUAGE}",
  AVAILABLE_LOCALES:        "${env.AVAILABLE_LOCALES}",

  DEFAULT_COORDINATES:      ${env.DEFAULT_COORDINATES},
  DEFAULT_LATITUDE:         ${env.DEFAULT_LATITUDE},
  DEFAULT_LONGITUDE:        ${env.DEFAULT_LONGITUDE},
  
  COMPANY_NAME:             "${env.COMPANY_NAME}",
  COMPANY_SITE_LINK:        "${env.COMPANY_SITE_LINK}",
  COMPANY_FACEBOOK_LINK:    "${env.COMPANY_FACEBOOK_LINK}",
  COMPANY_VKONTAKTE_LINK:   "${env.COMPANY_VKONTAKTE_LINK}",
  COMPANY_TWITTER_LINK:     "${env.COMPANY_TWITTER_LINK}",
  COMPANY_LINKEDIN_LINK:    "${env.COMPANY_LINKEDIN_LINK}",
  
  CURRENCY_SYMBOL:          "${env.CURRENCY_SYMBOL}",
  
  TALKJS_APP_ID:            "${env.TALKJS_APP_ID}",
  
  AUTH_LOGO:                "${env.AUTH_LOGO}",
  NO_INTERNET_LOGO:         "${env.NO_INTERNET_LOGO}",

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
  production:               ${isProd},

  LOG_LEVEL:                "${env.LOG_LEVEL}",

  DEFAULT_LANGUAGE:         "${env.DEFAULT_LANGUAGE}",
  AVAILABLE_LOCALES:        "${env.AVAILABLE_LOCALES}",

  DEFAULT_COORDINATES:      ${env.DEFAULT_COORDINATES},
  DEFAULT_LATITUDE:         ${env.DEFAULT_LATITUDE},
  DEFAULT_LONGITUDE:        ${env.DEFAULT_LONGITUDE},
  
  COMPANY_NAME:             "${env.COMPANY_NAME}",
  COMPANY_SITE_LINK:        "${env.COMPANY_SITE_LINK}",
  COMPANY_FACEBOOK_LINK:    "${env.COMPANY_FACEBOOK_LINK}",
  COMPANY_VKONTAKTE_LINK:   "${env.COMPANY_VKONTAKTE_LINK}",
  COMPANY_TWITTER_LINK:     "${env.COMPANY_TWITTER_LINK}",
  COMPANY_LINKEDIN_LINK:    "${env.COMPANY_LINKEDIN_LINK}",
  
  CURRENCY_SYMBOL:          "${env.CURRENCY_SYMBOL}",

  TALKJS_APP_ID:            "${env.TALKJS_APP_ID}",
  
  AUTH_LOGO:                "${env.AUTH_LOGO}",
  NO_INTERNET_LOGO:         "${env.NO_INTERNET_LOGO}",

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
} catch
{}
try
{
	unlinkSync(`./src/environments/environment.prod.ts`);
} catch
{}

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
