import { inject, injectable, multiInject }          from 'inversify';
import https                                        from 'https';
import http                                         from 'http';
import path                                         from 'path';
import pem                                          from 'pem';
import fs                                           from 'fs';
import bodyParser                                   from 'body-parser';
import cors                                         from 'cors';
import passport                                     from 'passport';
import methodOverride                               from 'method-override';
import errorhandler                                 from 'errorhandler';
import socketIO                                     from 'socket.io';
import express                                      from 'express';
import mongoose                                     from 'mongoose';
import morgan                                       from 'morgan';
import Bluebird                                     from 'bluebird';
import exphbs                                       from 'express-handlebars';
import ipstack                                      from 'ipstack';
import requestIp                                    from 'request-ip';
import { createConnection }                         from 'typeorm';
import { IRoutersManager }                          from '@pyro/io';
import { getModel }                                 from '@pyro/db-server';
import { getCurrency }                              from '@modules/server.common/data/currencies';
import { CountryAbbreviations }                     from '@modules/server.common/data/abbreviation-to-country';
import OAuthStrategy                                from '@modules/server.common/enums/OAuthStrategy';
import Admin                                        from '@modules/server.common/entities/Admin';
import Device                                       from '@modules/server.common/entities/Device';
import Carrier                                      from '@modules/server.common/entities/Carrier';
import Invite                                       from '@modules/server.common/entities/Invite';
import InviteRequest                                from '@modules/server.common/entities/InviteRequest';
import Order                                        from '@modules/server.common/entities/Order';
import Product                                      from '@modules/server.common/entities/Product';
import ProductsCategory                             from '@modules/server.common/entities/ProductsCategory';
import Customer                                     from '@modules/server.common/entities/Customer';
import Warehouse                                    from '@modules/server.common/entities/Warehouse';
import Promotion                                    from '@modules/server.common/entities/Promotion';
import CommonUtils                                  from '@modules/server.common/utilities/common';
import { FakeUsersService, TUserGenerationInput }   from './fake-data/FakeUsersService';
import { FakeWarehousesService }                    from './fake-data/FakeWarehousesService';
import IService, { ServiceSymbol }                  from './IService';
import { AdminsService }                            from './admins';
import { SocialStrategiesService }                  from './customers';
import { CustomersService }                         from './customers';
import { CurrenciesService }                        from './currency/CurrencyService';
import { CustomersAuthService }                     from './customers/CustomersAuthService';
import { WarehousesAuthService, WarehousesService } from './warehouses';
import { createLogger }                             from '../helpers/Log';
import { ConfigService }                            from '../config/config.service';
import { getCurrencyRates, convertCurrency }        from '../utils';
import { env }                                      from '../env';

// local IPs
const INTERNAL_IPS = ['127.0.0.1', '::1'];

@injectable()
export class ServicesApp
{
	protected static _poolSize: number;
	protected static _connectTimeoutMS: number;
	protected db_server = process.env.DB_ENV || 'primary';
	protected db: mongoose.Connection;
	protected expressApp: express.Express;
	protected httpsServer: https.Server;
	protected httpServer: http.Server;
	private log = createLogger({ name: 'main' });
	private callback: () => void;
	
	constructor(
			@multiInject(ServiceSymbol)
			protected services: IService[],
			@inject('RoutersManager')
			protected routersManager: IRoutersManager,
			@inject(WarehousesService)
			protected warehousesService: WarehousesService,
			@inject(WarehousesAuthService)
			protected warehousesAuthService: WarehousesAuthService,
			@inject(SocialStrategiesService)
			protected socialStrategiesService: SocialStrategiesService,
			@inject(AdminsService)
			private readonly _adminsService: AdminsService,
			@inject(CustomersService)
			private readonly _usersService: CustomersService,
			@inject(CustomersAuthService)
			private readonly _usersAuthService: CustomersAuthService,
			@inject(CurrenciesService)
			private readonly _currencyService: CurrenciesService,
			@inject(ConfigService)
					_configService: ConfigService
	)
	{
		console.log('Starting app')
		ServicesApp._poolSize = _configService.Env.DB_POOL_SIZE;
		ServicesApp._connectTimeoutMS = _configService.Env.DB_CONNECT_TIMEOUT;
		const maxSockets = _configService.Env.MAX_SOCKETS;
		
		// see https://webapplog.com/seven-things-you-should-stop-doing-with-node-js
		http.globalAgent.maxSockets = maxSockets;
		https.globalAgent.maxSockets = maxSockets;
		
		// If the Node process ends, close the Mongoose connection
		process
				.on('SIGINT', this._gracefulExit)
				.on('SIGTERM', this._gracefulExit);
	}
	
	static getEntities(): any[]
	{
		return [
			Admin,
			Carrier,
			// Conversation,
			Customer,
			Device,
			Invite,
			InviteRequest,
			Order,
			Product,
			ProductsCategory,
			Warehouse,
			Promotion
		];
	}
	
	static async CreateTypeORMConnection()
	{
		const typeORMLog = createLogger({ name: 'TypeORM' });
		
		// list of entities for which Repositories will be greated in TypeORM
		const entities = ServicesApp.getEntities();
		
		const conn = await createConnection({
			                                    name:               'typeorm',
			                                    type:               'mongodb',
			                                    url:                env.DB_URI,
			                                    entities:           entities,
			                                    synchronize:        true,
			                                    useNewUrlParser:    true,
			                                    poolSize:           ServicesApp._poolSize,
			                                    connectTimeoutMS:   ServicesApp._connectTimeoutMS,
			                                    logging:            true,
			                                    useUnifiedTopology: true
		                                    });
		
		typeORMLog.info(
				`TypeORM DB connection created. DB connected: ${conn.isConnected}`
		);
		
		return conn;
	}
	
	public async start(callback: () => void): Promise<void>
	{
		this.callback = callback;
		await this._connectDB();
	}
	
	private async _connectDB()
	{
		let connectionOptions: mongoose.ConnectionOptions = {
			useCreateIndex:     true,
			useNewUrlParser:    true,
			useFindAndModify:   false,
			poolSize:           env.DB_POOL_SIZE,
			connectTimeoutMS:   env.DB_CONNECT_TIMEOUT,
			useUnifiedTopology: true
		};
		
		try
		{
			const mongoConnect: mongoose.Mongoose = await mongoose.connect(
					env.DB_URI,
					connectionOptions
			);
			
			this.db = mongoConnect.connection;
			
			this._configDBEvents();
			
			await this._onDBConnect();
		} catch(err)
		{
			this.log.error(
					err,
					'Sever initialization failed! Cannot connect to DB'
			);
		}
	}
	
	private _configDBEvents()
	{
		this.db.on('error', (err) => this.log.error(err));
		
		this.db.on('disconnected', () =>
		{
			this.log.warn(
					'Mongoose default connection to DB :' +
					this.db_server +
					' disconnected'
			);
		});
		
		this.db.on('connected', () =>
		{
			this.log.info(
					'Mongoose default connection to DB :' +
					this.db_server +
					' connected'
			);
		});
	}
	
	private _gracefulExit()
	{
		try
		{
			if(this.db != null)
			{
				this.db.close((err) =>
				              {
					              if(!err)
					              {
						              this.log.info(
								              'Mongoose default connection with DB :' +
								              this.db_server +
								              ' is disconnected through app termination'
						              );
					              }
					              else
					              {
						              this.log.error(err);
					              }
					              process.exit(0);
				              }).then();
			}
		} catch(err)
		{
			process.exit(0);
		}
	}
	
	private async _onDBConnect()
	{
		if(env.isDev || env.isTest)
		{
			console.log('Connected to DB');
		}
		
		this.log.info({ db: this.db_server }, 'Connected to DB');
		
		await this._registerModels();
		await this._registerEntityAdministrator();
		await this._registerTestMerchantAndWarehouse();
		await this._populateCurrencies();
		this._passportSetup();
		await this._startExpress();
		await this._startSocketIO();
		
		// execute callback defined at main.ts
		await this.callback();
		
		// let's report RAM usage after all is bootstrapped
		if(env.isDev)
		{
			await ServicesApp.reportMemoryUsage();
		}
	}
	
	private static async reportMemoryUsage()
	{
		console.log('Memory usage: ');
		console.log(process.memoryUsage());
	}
	
	/**
	 * Create initial (default) Admin user with default credentials:
	 *
	 * @private
	 * @memberof ServicesApp
	 */
	private async _registerEntityAdministrator()
	{
		const adminName = "Admin";
		const adminEmail = env.DEFAULT_ADMIN_MAIL;
		const adminPassword = env.DEFAULT_ADMIN_PASSWORD;
		
		const adminCollectionCount = await this._adminsService.count({
			                                                             email: adminEmail
		                                                             });
		if(adminCollectionCount === 0)
		{
			await this._adminsService
			          .register({
				                    admin:    {
					                    email:    adminEmail,
					                    username: adminName,
					                    hash:     null,
					                    role:     "admin",
					                    avatar:   CommonUtils.getDummyImage(300, 300, adminName.slice(0, 2))
				                    },
				                    password: adminPassword
			                    });
		}
	}
	
	private async _registerTestMerchantAndWarehouse(): Promise<void>
	{
		if(!env.isProd)
		{
			let warehouse;
			const userInput: TUserGenerationInput = {
				username:    env.FAKE_MERCHANT_NAME,
				email:       env.FAKE_MERCHANT_EMAIL,
				role:        "merchant",
				coordinates: [
					env.DEFAULT_LONGITUDE,
					env.DEFAULT_LATITUDE
				]
			};
			
			const password = env.FAKE_MERCHANT_PASSWORD;
			try
			{
				const fakeUsersService =
						      new FakeUsersService(
								      this._usersService,
								      this._usersAuthService
						      );
				const fakeWarehousesService =
						      new FakeWarehousesService(
								      this._usersService,
								      this.warehousesService,
								      this.warehousesAuthService
						      );
				
				const merchant = await fakeUsersService.generateMerchant(userInput, env.FAKE_MERCHANT_PASSWORD);
				if(merchant)
				{
					this.log.info(
							`Created test merchant`,
							{ merchantId: merchant.id }
					);
					
					warehouse = await fakeWarehousesService
							.generateWarehouse(merchant, password);
					
					this.log.info(
							`Created test warehouse`,
							{ warehouseId: warehouse.id }
					);
				}
				else
				{
					this.log.warn("Merchant doesn't exist");
				}
				
			} catch(err)
			{
				this.log.warn("Couldn't create test merchant and/or warehouse", err);
			}
		}
	}
	
	private async _populateCurrencies()
	{
		const currencies = await this._currencyService.getAllCurrencies();
		
		if(!currencies.length)
		{
			for(const abbr in CountryAbbreviations)
			{
				const data = getCurrency(abbr);
				if(data)
				{
					try
					{
						await this._currencyService
						          .createCurrency({
							                          code:  data.code,
							                          name:  data?.name,
							                          sign:  data?.sign ?? data.code,
							                          order: data?.order
						                          })
					} catch(e)
					{
						console.error(`Error on currency create: ${e.message}`);
					}
				}
				
			}
		}
	}
	
	private static _getBaseUrl(url: string)
	{
		if(url)
		{
			return url.slice(0, url.lastIndexOf('/') + 1).toString();
		}
	}
	
	private _passportSetup()
	{
		passport.serializeUser((user, done) =>
		                       {
			                       done(null, user);
		                       });
		
		passport.deserializeUser(() =>
		                         {
			                         // TODO ?
		                         });
		
		this._registerPassportStrategy(OAuthStrategy.YANDEX);
		this._registerPassportStrategy(OAuthStrategy.GOOGLE);
		this._registerPassportStrategy(OAuthStrategy.FACEBOOK);
		this._registerPassportStrategy(OAuthStrategy.VKONTAKTE);
	}
	
	private _registerPassportStrategy(oauth: OAuthStrategy)
	{
		const strategy = this.socialStrategiesService
		                     .getStrategy(oauth);
		if(strategy != null)
		{
			passport.use(strategy);
			this.log.info(`Found ${oauth} config!`);
		}
		else
		{
			if(env.isDev || env.isTest)
			{
				this.log.warn(`${oauth} is not enabled`);
			}
		}
	}
	
	private async _registerModels()
	{
		await (<any>Bluebird).map(this.services, async(service: IService[]) =>
		{
			if((service as any).DBObject != null)
			{
				// get the model to register it's schema indexes in db
				await getModel((service as any).DBObject).createIndexes();
			}
		});
	}
	
	private async _startExpress()
	{
		this.expressApp = express();
		
		const hbs = exphbs.create({
			                          extname:       '.hbs',
			                          defaultLayout: 'main',
			                          layoutsDir:    path.join('res', 'views', 'layouts'),
			                          partialsDir:   path.join('res', 'templates')
		                          });
		
		// configure Handlebars templates
		this.expressApp.engine('.hbs', hbs.engine);
		
		this.expressApp.set('views', path.join('res', 'views'));
		
		this.expressApp.set('view engine', '.hbs');
		
		this.expressApp.set('view cache', false);
		
		// now we check if Cert files exists and if not generate them for localhost
		const httpsCertPath = env.HTTPS_CERT_PATH;
		const httpsKeyPath = env.HTTPS_KEY_PATH;
		
		const hasHttpsCert = fs.existsSync(httpsCertPath);
		const hasHttpsKey = fs.existsSync(httpsKeyPath);
		
		let hasDefaultHttpsCert = false;
		
		if(!hasHttpsCert || !hasHttpsKey)
		{
			hasDefaultHttpsCert = await this._getCertificates(
					httpsCertPath,
					httpsKeyPath
			);
		}
		
		if((hasHttpsCert && hasHttpsKey) || hasDefaultHttpsCert)
		{
			this.httpsServer = https.createServer(
					{
						cert: fs.readFileSync(httpsCertPath),
						key:  fs.readFileSync(httpsKeyPath)
					},
					this.expressApp
			);
		}
		
		this.httpServer = http.createServer(this.expressApp);
		
		const timeout = env.CONNECTION_TIMEOUT * 60 * 1000;
		
		if(this.httpsServer)
		{
			this.httpsServer.setTimeout(timeout);
		}
		
		this.httpServer.setTimeout(timeout);
		
		const [httpsHost, httpsPort] = CommonUtils.getHostAndPort(env.HTTPS_SERVICES_ENDPOINT);
		const [httpHost, httpPort] = CommonUtils.getHostAndPort(env.SERVICES_ENDPOINT);
		
		this.expressApp.set('httpsHost', httpsHost);
		this.expressApp.set('httpsPort', httpsPort);
		this.expressApp.set('httpHost', httpHost);
		this.expressApp.set('httpPort', httpPort);
		
		this.expressApp.set('environment', env.NODE_ENV);
		
		// CORS configuration
		// TODO: we may want to restric access some way
		// (but needs to be careful because we serve some HTML pages for all clients too, e.g. About Us)
		
		// const methods: string[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
		// let origins = env.ALLOWED_ORIGINS.split(',');
		
		// const corsOptions = {
		// 	origin:        (origin, cb) =>
		// 	               {
		// 		               if(origins.indexOf(origin) !== -1)
		// 		               {
		// 			               cb(null, true)
		// 		               }
		// 		               else
		// 		               {
		// 			               cb(new Error('Not allowed by CORS'))
		// 		               }
		// 	               },
		// 	allowedHeader: ['Access-Control-Allow-Origin'],
		// 	credentials:   true
		// };
		
		const corsOptions = {
			origin:      true,
			credentials: true
		};
		
		this.expressApp.use(cors(corsOptions));
		
		this.expressApp.use(bodyParser.urlencoded({ extended: false }));
		this.expressApp.use(bodyParser.json());
		this.expressApp.use(
				bodyParser.json({ type: 'application/vnd.api+json' })
		);
		
		this.expressApp.use(methodOverride('X-HTTP-Method')); // Microsoft
		this.expressApp.use(methodOverride('X-HTTP-Method-Override')); // Google/GData
		this.expressApp.use(methodOverride('X-Method-Override')); // IBM
		this.expressApp.use(morgan('dev'));
		this.expressApp.use(passport.initialize());
		this.expressApp.use(requestIp.mw());
		
		if(this.expressApp.get('environment') === 'development')
		{
			this.expressApp.use(errorhandler());
		}
		
		this.expressApp.get('/',
		                    (
				                    req,
				                    res
		                    ) =>
		                    {
			                    res.render('index');
		                    });
		
		// Get location (lat, long) by IP address
		this.expressApp.get('/getLocationByIP',
		                    (req, res) =>
		                    {
			                    const ipStackKey = env.IP_STACK_API_KEY;
			                    if(ipStackKey)
			                    {
				                    let clientIp: string = req['clientIp'] || null;
				
				                    if(!clientIp)
				                    {
					                    if(
							                    'x-forwarded-for' in req.headers &&
							                    req.headers['x-forwarded-for'].length > 0
					                    )
					                    {
						                    clientIp = req.headers['x-forwarded-for'][0]
					                    }
					                    else
					                    {
						                    clientIp = req.socket['remoteAddress'];
					                    }
				                    }
				
				                    this.log.debug({
					                                   clientIp,
					                                   remoteAddress:  req.socket['remoteAddress'],
					                                   requestHeaders: req.headers
				                                   })
				
				                    if(!INTERNAL_IPS.includes(clientIp))
				                    {
					                    ipstack(clientIp, ipStackKey, (err, response) =>
					                    {
						                    res.json({
							                             latitude:  response.latitude,
							                             longitude: response.longitude
						                             });
					                    });
				                    }
				                    else
				                    {
					                    this.log.info(
							                    `Can't use ipstack with internal ip address ${clientIp}`
					                    );
					                    res.status(204).end();
				                    }
			                    }
			                    else
			                    {
				                    this.log.error('Not provided Key for IpStack');
				                    res.status(500).end();
			                    }
		                    });
		
		this.expressApp.get('/currency_rates', (req, res) =>
		{
			try
			{
				const fromCurrencyCode = req.query['from'] as string;
				const toCurrencyCode = req.query['to'] as string;
				const makeKey = () => `${fromCurrencyCode}_${toCurrencyCode}`;
				
				getCurrencyRates(fromCurrencyCode, toCurrencyCode)
						.then(response =>
						      {
							      if(response)
								      if(response.query.count > 0)
									      res.json(response.results[makeKey()]);
						      });
			} catch(e)
			{
				this.log.error(e)
				res.status(400).end();
			}
		});
		
		this.expressApp.get('/convert_currency', (req, res) =>
		{
			try
			{
				const fromCurrency = req.query['from'] as string;
				const toCurrency = req.query['to'] as string;
				if("amount" in req.query)
				{
					const amount = parseFloat((<string>req.query['amount']));
					convertCurrency(fromCurrency, toCurrency, amount)
							.then(c => res.json({ amount: c }));
				}
				else
				{
					res.json({ amount: -1 });
					res.status(406).end();
				}
			} catch(e)
			{
				this.log.error(e)
				res.status(400).end();
			}
		});
		
		this._setupAuthRoutes();
		this._setupStaticRoutes();
		
		const httpsUrl = `${httpsHost}:${httpsPort}`;
		const httpUrl = `${httpHost}:${httpPort}`;
		
		const environment = this.expressApp.get('environment');
		
		this.log.info(
				{
					httpsUrl,
					httpUrl,
					environment
				},
				'Express server prepare to listen'
		);
		
		if(httpsPort && httpsPort > 0 && this.httpsServer)
		{
			// app listen on https
			this.httpsServer.listen(httpsPort, httpsHost, () =>
			{
				this.log.info(
						{
							host: httpsHost,
							port: httpsPort
						},
						'Express https server listening'
				);
				console.log(
						`Express https server listening on https://${httpsHost}:${httpsPort}`
				);
			});
		}
		else
		{
			this.log.warn(
					`No SSL Certificate exists, HTTPS endpoint will be disabled`
			);
		}
		
		if(httpPort && httpPort > 0)
		{
			// app listen on http
			this.httpServer.listen(httpPort, httpHost, () =>
			{
				this.log.info(
						{
							host: httpHost,
							port: httpPort
						},
						'Express http server listening'
				);
				console.log(
						`Express http server listening on port http://${httpHost}:${httpPort}`
				);
			});
		}
	}
	
	private async _getCertificates(
			httpsCertPath: string,
			httpsKeyPath: string
	)
	{
		try
		{
			this.log.info('Generating SSL Certificates for HTTPS');
			
			const { success } = await this._createCertificateAsync(
					httpsCertPath,
					httpsKeyPath
			);
			
			this.log.info('Certificates were generated');
			
			return success;
		} catch(error)
		{
			this.log.warn(
					`Certificates were not generated due to error: ${error.message}`
			);
			
			return false;
		}
	}
	
	private _createCertificateAsync(
			httpsCertPath: string,
			httpsKeyPath: string
	): Promise<{ success: boolean }>
	{
		return new Promise((resolve, reject) =>
		                   {
			                   try
			                   {
				                   pem.createCertificate(
						                   {
							                   days:       365,
							                   selfSigned: true
						                   },
						                   (err, keys) =>
						                   {
							                   if(err)
							                   {
								                   reject({ success: false, message: err.message });
								                   return;
							                   }
							
							                   const httpsCertDirPath = path.dirname(httpsCertPath);
							                   const httpsKeyDirPath = path.dirname(httpsKeyPath);
							
							                   if(!fs.existsSync(httpsCertDirPath))
							                   {
								                   fs.mkdirSync(httpsCertDirPath, {
									                   recursive: true
								                   });
							                   }
							
							                   if(!fs.existsSync(httpsKeyDirPath))
							                   {
								                   fs.mkdirSync(httpsKeyDirPath, {
									                   recursive: true
								                   });
							                   }
							
							                   fs.writeFileSync(httpsCertPath, keys.certificate);
							                   fs.writeFileSync(httpsKeyPath, keys.serviceKey);
							
							                   resolve({ success: true });
						                   }
				                   );
			                   } catch(err)
			                   {
				                   reject({ success: false, message: err.message });
			                   }
		                   });
	}
	
	private async _startSocketIO()
	{
		const origins = env.ALLOWED_ORIGINS.split(',');
		const methods: string = "GET,POST,PUT,PATCH,DELETE";
		
		const corsOptions: socketIO.ServerOptions = {
			allowRequest: (req: http.IncomingMessage, cb: (err: any, success: boolean) => void) =>
			              {
				              const origin = req.headers.host;
				              const result = env.ENABLE_ORIGIN_RESTRICTION
				                             ? origins.filter(o => o.includes(origin)).length > 0
				                             : true;
				              const errMessage = `Error: Origin ${origin} not found in allowed origins`;
				              cb(result ? null : errMessage, result);
			              },
			handlePreflightRequest:
			              (req: http.IncomingMessage, res: http.ServerResponse) =>
			              {
				              res.writeHead(200, {
					              "Access-Control-Allow-Origin":      env.ENABLE_ORIGIN_RESTRICTION
					                                                  ? origins.join(',') : "*",
					              "Access-Control-Allow-Methods":     methods,
					              "Access-Control-Allow-Headers":     'true',
					              "Access-Control-Allow-Credentials": 'true'
				              });
				              res.end();
			              },
			pingInterval: 10000
		};
		
		const ioHttps = socketIO(this.httpsServer, corsOptions);
		const ioHttp = socketIO(this.httpServer, corsOptions);
		
		await this.routersManager.startListening(ioHttps);
		await this.routersManager.startListening(ioHttp);
	}
	
	private _setupStaticRoutes()
	{
		env.AVAILABLE_LOCALES
		   .split('|')
		   .map((lang: string) => lang.slice(0, 2))
		   .forEach((lang: string) =>
		            {
			            this.expressApp
			                .get(`/${lang}/about`,
			                     (req, res) => res.render(`about_us_${lang}`));
			
			            this.expressApp
			                .get(`/${lang}/privacy`,
			                     (req, res) => res.render(`privacy_${lang}`));
			
			            this.expressApp
			                .get(`/${lang}/terms`,
			                     (req, res) => res.render(`terms_of_use_${lang}`));
		            })
	}
	
	private _setupAuthRoutes()
	{
		// Facebook route auth
		this._authRoutesHelper({
			                       name:             'facebook',
			                       auth_url:         '/auth/facebook',
			                       callback_url:     '/auth/facebook',
			                       failure_redirect: '/login',
			                       scope:            ['email', 'public_profile']
		                       })
		
		// Yandex route auth
		this._authRoutesHelper({
			                       name:             'yandex',
			                       auth_url:         '/auth/yandex',
			                       callback_url:     '/auth/yandex/callback',
			                       failure_redirect: '/login',
			                       scope:            ['profile', 'email']
		                       })
		
		// Google route auth
		this._authRoutesHelper({
			                       name:             'google',
			                       auth_url:         '/auth/google',
			                       callback_url:     '/auth/google/callback',
			                       failure_redirect: '/login',
			                       scope:            ['profile', 'email']
		                       })
	}
	
	private _authRoutesHelper(strategy: {
		name: string;
		auth_url: string;
		callback_url: string;
		failure_redirect?: string;
		scope?: string[];
	})
	{
		this.expressApp.get(
				strategy.auth_url,
				(req, res, next) =>
				{
					passport[
							'_strategies'
							].session.base_redirect_url = ServicesApp._getBaseUrl(
							req.headers.referer
					);
					next();
				},
				passport.authenticate(strategy.name, { scope: strategy.scope })
		);
		
		this.expressApp.get(
				strategy.callback_url,
				passport.authenticate(strategy.name,
				                      { failureRedirect: strategy.failure_redirect ?? '/login' }),
				async(req, res) =>
				{
					const baseRedirectUr =
							      passport['_strategies'].session.base_redirect_url;
					if(req.user)
					{
						res.redirect(baseRedirectUr + (<any>req.user).redirectUrl);
					}
					else
					{
						res.redirect(baseRedirectUr || '');
					}
					passport['_strategies'].session.base_redirect_url = '';
				}
		);
	}
}
