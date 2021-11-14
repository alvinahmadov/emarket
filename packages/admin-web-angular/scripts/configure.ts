// NOTE: do NOT ever put here any secure settings! (e.g. Secret Keys)
// We are using dotenv (.env) for consistency with other Platform projects
// This is Angular app and all settings will be loaded into the client browser!

import { env }                   from './env';
import { writeFile, unlinkSync } from 'fs';
import { argv }                  from 'yargs';

const environment = argv.environment;
const isProd = environment === 'prod' || env.production;

let mode = isProd
           ? 'production'
           : 'development';

console.info(`Configuring in ${mode} mode`)

if(!env.GOOGLE_MAPS_API_KEY)
{
	console.warn(
			'WARNING: No Google Maps API Key defined in the .env. Google Maps may not be visible!'
	);
}

const envFileContent = `// NOTE: Auto-generated file
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses 'environment.ts', but if you do
// 'ng build --env=prod' then 'environment.prod.ts' will be used instead.
// The list of which env maps to which file can be found in '.angular-cli.json'.

import { Environment } from './model';

export const environment: Environment = {
  production: ${isProd},

  HTTP_SERVICES_ENDPOINT: '${env.HTTP_SERVICES_ENDPOINT}',
  HTTPS_SERVICES_ENDPOINT: '${env.HTTPS_SERVICES_ENDPOINT}',
  GQL_ENDPOINT: '${env.GQL_ENDPOINT}',
  GQL_SUBSCRIPTIONS_ENDPOINT: '${env.GQL_SUBSCRIPTIONS_ENDPOINT}',

  GOOGLE_MAPS_API_KEY: '${env.GOOGLE_MAPS_API_KEY}',
  YANDEX_MAPS_API_KEY: '${env.YANDEX_MAPS_API_KEY}',
  
  TALKJS_APP_ID: '${env.TALKJS_APP_ID}',

  JWT_EXPIRES_MAX: '${env.JWT_EXPIRES_MAX}',
  JWT_EXPIRES_MIN: '${env.JWT_EXPIRES_MIN}',

  DEFAULT_LATITUDE: ${env.DEFAULT_LATITUDE},
  DEFAULT_LONGITUDE: ${env.DEFAULT_LONGITUDE},

  NO_INTERNET_LOGO: '${env.NO_INTERNET_LOGO}',

  MAP_MERCHANT_ICON_LINK: '${env.MAP_MERCHANT_ICON_LINK}',

  MAP_USER_ICON_LINK: '${env.MAP_USER_ICON_LINK}',

  MAP_CARRIER_ICON_LINK: '${env.MAP_CARRIER_ICON_LINK}',

  CLOUDINARY_UPLOAD_URL: '${env.CLOUDINARY_UPLOAD_URL}',
  CLOUDINARY_SIGNED_UPLOAD_PRESET: '${env.CLOUDINARY_SIGNED_UPLOAD_PRESET}',
  CLOUDINARY_UNSIGNED_UPLOAD_PRESET: '${env.CLOUDINARY_UNSIGNED_UPLOAD_PRESET}',

  COMPANY_NAME: '${env.COMPANY_NAME}',
  COMPANY_SITE_LINK: '${env.COMPANY_SITE_LINK}',
  COMPANY_GITHUB_LINK: '${env.COMPANY_GITHUB_LINK}',
  COMPANY_FACEBOOK_LINK: '${env.COMPANY_FACEBOOK_LINK}',
  COMPANY_TWITTER_LINK: '${env.COMPANY_TWITTER_LINK}',
  COMPANY_LINKEDIN_LINK: '${env.COMPANY_LINKEDIN_LINK}',

  GENERATE_PASSWORD_CHARSET: '${env.GENERATE_PASSWORD_CHARSET}',

  CURRENCY_SYMBOL: '${env.CURRENCY_SYMBOL}',
  
  FAKE_CUSTOMERS_COUNT: ${env.FAKE_CUSTOMERS_COUNT},

  DEFAULT_LANGUAGE: '${env.DEFAULT_LANGUAGE}',
  AVAILABLE_LOCALES: '${env.AVAILABLE_LOCALES}',

  // For maintenance micro service.
  SETTINGS_APP_TYPE: '${env.SETTINGS_APP_TYPE}',
  SETTINGS_MAINTENANCE_API_URL: '${env.SETTINGS_MAINTENANCE_API_URL}'
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

writeFile(`./src/environments/${envFileDest}`, envFileContent, function(err)
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

writeFile(`./src/environments/${envFileDestOther}`, envFileContent, function(
		err
)
{
	if(err)
	{
		console.log(err);
	}
	else
	{
		console.log(`Generated Angular environment file: ${envFileDestOther}`);
	}
});
