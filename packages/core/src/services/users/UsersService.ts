import Logger                                       from 'bunyan';
import _                                            from 'lodash';
import { inject, injectable, LazyServiceIdentifer } from 'inversify';
import { Observable }                               from 'rxjs';
import {
	distinctUntilChanged,
	exhaustMap,
	first,
	publishReplay,
	refCount,
	switchMap,
	tap,
	map
}                                                   from 'rxjs/operators';
import { of }                                       from 'rxjs/observable/of';
import { _throw }                                   from 'rxjs/observable/throw';
import Stripe                                       from 'stripe';
import { v1 as uuid }                               from 'uuid';
import {
	asyncListener,
	observableListener,
	routerName,
	serialization
}                                                   from '@pyro/io';
import { DBService }                                from '@pyro/db-server';
import ILanguage                                    from '@modules/server.common/interfaces/ILanguage';
import {
	IUserCreateObject,
	IUserInitializeObject
}                                                   from '@modules/server.common/interfaces/IUser';
import IPagingOptions                               from '@modules/server.common/interfaces/IPagingOptions';
import IGeoLocation                                 from '@modules/server.common/interfaces/IGeoLocation';
import User                                         from '@modules/server.common/entities/User';
import GeoLocation                                  from '@modules/server.common/entities/GeoLocation';
import IUserRouter                                  from '@modules/server.common/routers/IUserRouter';
import { InvitesService }                           from '../invites';
import { DevicesService }                           from '../devices';
import IService                                     from '../IService';
import { WarehousesService }                        from '../../services/warehouses';
import { createLogger }                             from '../../helpers/Log';
import { observeFile }                              from '../../utils';
import { env }                                      from '../../env';

interface IWatchedFiles
{
	aboutUs: { [language in ILanguage]: Observable<string> };
	privacy: { [language in ILanguage]: Observable<string> };
	termsOfUse: { [language in ILanguage]: Observable<string> };
	help: { [language in ILanguage]: Observable<string> };
}

/**
 * Customers Service
 *
 * @export
 * @class UsersService
 * @extends {DBService<User>}
 * @implements {IUserRouter}
 * @implements {IService}
 */
@injectable()
@routerName('user')
export class UsersService extends DBService<User>
		implements IUserRouter, IService
{
	public readonly DBObject: any = User;
	public watchedFiles: IWatchedFiles;
	protected readonly log: Logger = createLogger({
		                                              name: 'usersService'
	                                              });
	// TODO: this and other Stripe related things should be inside separate Payments Service
	private stripe = new Stripe(env.STRIPE_SECRET_KEY);
	
	constructor(
			@inject(new LazyServiceIdentifer(() => InvitesService))
			protected invitesService: InvitesService,
			@inject(new LazyServiceIdentifer(() => DevicesService))
			protected devicesService: DevicesService,
			@inject(new LazyServiceIdentifer(() => WarehousesService))
			protected _storesService: WarehousesService
	)
	{
		super();
		const availableLocales: string[] = env.AVAILABLE_LOCALES.split('|')
		this.watchedFiles = _.zipObject(
				['aboutUs', 'privacy', 'termsOfUse', 'help'],
				_.map(['about_us', 'privacy', 'terms_of_use', 'help'], folder =>
				      {
					      _.zipObject(
							      availableLocales,
							      _.map(availableLocales, language =>
							            {
								            observeFile(
										            `${__dirname}/../../../../res/templates/${folder}/${language}.hbs`
								            ).pipe(
										            tap({ error: (err) => this.log.error(err) }),
										            publishReplay(1),
										            refCount<string>()
								            )
							            }
							      )
					      )
				      }
				)
		) as any;
	}
	
	/**
	 * Verify if customer with given email already exists
	 *
	 * @param {string} email
	 * @returns {Promise<boolean>}
	 * @memberof UsersService
	 */
	async isUserEmailExists(email: string): Promise<boolean>
	{
		return (await this.count({ email })) > 0;
	}
	
	/**
	 * Get Customer by given social Id
	 *
	 * @param {string} socialId
	 * @returns {Promise<User>}
	 * @memberof UsersService
	 */
	async getSocial(socialId: string): Promise<User>
	{
		return super.findOne({
			                     socialIds: { $in: [socialId] },
			                     isDeleted: { $eq: false }
		                     });
	}
	
	/**
	 * Create new customer (intialize record)
	 *
	 * @param {IUserInitializeObject} userInitializeObject
	 * @returns {Promise<User>}
	 * @memberof UsersService
	 */
	async initUser(userInitializeObject: IUserInitializeObject): Promise<User>
	{
		return super.create(userInitializeObject as any);
	}
	
	/**
	 * Get Customers
	 *
	 * @param {*} findInput
	 * @param {IPagingOptions} pagingOptions
	 * @returns
	 * @memberof UsersService
	 */
	async getUsers(findInput: any, pagingOptions: IPagingOptions)
	{
		const sortObj = {};
		if(pagingOptions.sort)
		{
			sortObj[pagingOptions.sort.field] = pagingOptions.sort.sortBy;
		}
		
		return this.Model.find({
			                       ...findInput,
			                       isDeleted: { $eq: false }
		                       })
		           .sort(sortObj)
		           .skip(pagingOptions.skip)
		           .limit(pagingOptions.limit)
		           .lean()
		           .exec();
	}
	
	/**
	 * Updates Customer details
	 * // TODO function actually returns User | null we should fix that.
	 *
	 * @param {string} id
	 * @param {IUserCreateObject} userCreateObject
	 * @returns {Promise<User>}
	 * @memberof UsersService
	 */
	@asyncListener()
	async updateUser(
			id: string,
			userCreateObject: IUserCreateObject
	): Promise<User>
	{
		await this.throwIfNotExists(id);
		return super.update(id, userCreateObject);
	}
	
	/**
	 * Get Customer by Id
	 *
	 * @param {string} customerId
	 * @returns {Observable<User>}
	 * @memberof UsersService
	 */
	@observableListener()
	get(customerId: string): Observable<User>
	{
		return super.get(customerId)
		            .pipe(
				            map(async(user) =>
				                {
					                await this.throwIfNotExists(customerId);
					                return user;
				                }),
				            switchMap((user) => user)
		            );
	}
	
	/**
	 * Get Stripe Cards for given customer
	 * TODO: move to separate Stripe (Payments) Service
	 *
	 * @param {string} userId
	 * @returns {Promise<Stripe.cards.ICard[]>}
	 * @memberof UsersService
	 */
	@asyncListener()
	async getCards(userId: string): Promise<Stripe.cards.ICard[]>
	{
		await this.throwIfNotExists(userId);
		
		const user = await this.get(userId)
		                       .pipe(first())
		                       .toPromise();
		
		if(user != null)
		{
			if(user.stripeCustomerId != null)
			{
				return (
						await this.stripe
						          .customers
						          .listSources(
								          user.stripeCustomerId,
								          {
									          object: 'card'
								          }
						          )
				).data;
			}
			else
			{
				return [];
			}
		}
		else
		{
			throw new Error(`User with the id ${userId} doesn't exist`);
		}
	}
	
	/**
	 * Add Payment Method (Credit Card) for the customer.
	 * If method called first time for given customer, it creates Customer record in the Stripe API and
	 * updates stripeCustomerId in our DB
	 *
	 * TODO: move to separate Stripe (Payments) Service
	 *
	 * @param {string} userId
	 * @param {string} tokenId
	 * @returns {Promise<string>}
	 * @memberof UsersService
	 */
	@asyncListener()
	async addPaymentMethod(userId: string, tokenId: string): Promise<string>
	{
		await this.throwIfNotExists(userId);
		
		const callId = uuid();
		
		this.log.info(
				{ callId, userId, tokenId },
				'.addPaymentMethod(userId, tokenId) called'
		);
		
		let card: Stripe.cards.ICard;
		
		try
		{
			let user = await this.get(userId)
			                     .pipe(first())
			                     .toPromise();
			
			if(user != null)
			{
				if(user.stripeCustomerId == null)
				{
					const customer = await this.stripe
					                           .customers
					                           .create({
						                                   email: user.email,
						                                   description: 'User id: ' + user.id,
						                                   metadata: {
							                                   userId: user.id
						                                   }
					                                   });
					
					user = await this.update(userId, {
						stripeCustomerId: customer.id
					});
				}
				
				card = (
						await this.stripe
						          .customers
						          .createSource(
								          user.stripeCustomerId as string,
								          {
									          source: tokenId
								          }
						          )
				) as Stripe.cards.ICard;
			}
			else
			{
				throw new Error(`User with the id ${userId} doesn't exist`);
			}
		} catch(err)
		{
			this.log.error(
					{ callId, userId, tokenId, err },
					'.addPaymentMethod(userId, tokenId) thrown error!'
			);
			throw err;
		}
		
		this.log.info(
				{ callId, userId, tokenId, card },
				'.addPaymentMethod(userId, tokenId) added payment method'
		);
		
		return card.id;
	}
	
	/**
	 * Update email for given Customer (by customer Id)
	 *
	 * @param {string} userId
	 * @param {string} email
	 * @returns {Promise<User>}
	 * @memberof UsersService
	 */
	@asyncListener()
	async updateEmail(userId: string, email: string): Promise<User>
	{
		await this.throwIfNotExists(userId);
		return this.update(userId, { email });
	}
	
	/**
	 * Update current location (address) for given Customer
	 *
	 * @param {string} userId
	 * @param {GeoLocation} geoLocation
	 * @returns {Promise<User>}
	 * @memberof UsersService
	 */
	@asyncListener()
	async updateGeoLocation(
			userId: string,
			@serialization((g: IGeoLocation) => new GeoLocation(g))
					geoLocation: GeoLocation
	): Promise<User>
	{
		await this.throwIfNotExists(userId);
		return this.update(userId, { geoLocation });
	}
	
	/**
	 * Get About Us Content (HTML)
	 * Note: Depending on user country, language and other settings, we may want later to show different About Us page
	 * (e.g. show different contact details or branch location etc)
	 * @param userId
	 * @param deviceId
	 * @param selectedLanguage
	 * @returns HTML representation of About Us
	 */
	@observableListener()
	getAboutUs(
			userId: string,
			deviceId: string,
			selectedLanguage: string
	): Observable<string> /*returns html*/
	{
		return this.devicesService
		           .get(deviceId)
		           .pipe(
				           exhaustMap((device) =>
				                      {
					                      if(device === null)
					                      {
						                      return _throw(
								                      new Error(`User with the id ${userId} doesn't exist`)
						                      );
					                      }
					                      else
					                      {
						                      return of(device);
					                      }
				                      }),
				           distinctUntilChanged(
						           (oldDevice, newDevice) =>
								           oldDevice.language !== newDevice.language
				           ),
				           switchMap((device) => this.watchedFiles.aboutUs[selectedLanguage as ILanguage])
		           );
	}
	
	/**
	 * Get Terms Of Use Content (HTML)
	 * Note: Depending on user country, language and other settings, we may want later to show different Terms
	 * @param userId
	 * @param deviceId
	 * @param selectedLanguage
	 * @returns HTML representation of Terms Of Use
	 */
	@observableListener()
	getTermsOfUse(
			userId: string,
			deviceId: string,
			selectedLanguage: string
	): Observable<string>
	{
		return this.devicesService
		           .get(deviceId)
		           .pipe(
				           exhaustMap((device) =>
				                      {
					                      if(device === null)
					                      {
						                      return _throw(
								                      new Error(
										                      `Device with the id ${deviceId} doesn't exist`
								                      )
						                      );
					                      }
					                      else
					                      {
						                      return of(device);
					                      }
				                      }),
				           distinctUntilChanged(
						           (oldDevice, newDevice) =>
								           oldDevice.language !== newDevice.language
				           ),
				           switchMap((device) => this.watchedFiles.termsOfUse[selectedLanguage as ILanguage])
		           );
	}
	
	/**
	 * Get Privacy Policy Content (HTML)
	 * Note: Depending on user country, language and other settings, we may want later to show different Policy
	 * @param userId
	 * @param deviceId
	 * @param selectedLanguage
	 * @returns HTML representation of privacy policy
	 */
	@observableListener()
	getPrivacy(
			userId: string,
			deviceId: string,
			selectedLanguage: string
	): Observable<string>
	{
		return this.devicesService
		           .get(deviceId)
		           .pipe(
				           exhaustMap((device) =>
				                      {
					                      if(device === null)
					                      {
						                      return _throw(
								                      new Error(`User with the id ${userId} doesn't exist`)
						                      );
					                      }
					                      else
					                      {
						                      return of(device);
					                      }
				                      }),
				           distinctUntilChanged(
						           (oldDevice, newDevice) =>
								           oldDevice.language !== newDevice.language
				           ),
				           switchMap((device) => this.watchedFiles.privacy[selectedLanguage as ILanguage])
		           );
	}
	
	/**
	 * Get Help Content (HTML)
	 * Note: Depending on user country, language and other settings, we may want later to show different Help
	 * @param userId
	 * @param deviceId
	 * @param selectedLanguage
	 * @returns HTML representation of privacy policy
	 */
	@observableListener()
	getHelp(
			userId: string,
			deviceId: string,
			selectedLanguage: string
	): Observable<string>
	{
		return this.devicesService
		           .get(deviceId)
		           .pipe(
				           exhaustMap((device) =>
				                      {
					                      if(device === null)
					                      {
						                      return _throw(
								                      new Error(`User with the id ${userId} doesn't exist`)
						                      );
					                      }
					                      else
					                      {
						                      return of(device);
					                      }
				                      }),
				           distinctUntilChanged(
						           (oldDevice, newDevice) =>
								           oldDevice.language !== newDevice.language
				           ),
				           switchMap((device) => this.watchedFiles.help[selectedLanguage as ILanguage])
		           );
	}
	
	async banUser(id: string): Promise<User>
	{
		await this.throwIfNotExists(id);
		return this.update(id, { isBanned: true });
	}
	
	async unbanUser(id: string): Promise<User>
	{
		await this.throwIfNotExists(id);
		return this.update(id, { isBanned: false });
	}
	
	/**
	 * Check if not deleted customer with given Id exists in DB and throw exception if it's not exists or deleted
	 *
	 * @param {string} userId
	 * @memberof UsersService
	 */
	async throwIfNotExists(userId: string)
	{
		const user = await super.get(userId)
		                        .pipe(first())
		                        .toPromise();
		
		if(!user || user.isDeleted)
		{
			throw Error(`Customer with id '${userId}' does not exists!`);
		}
	}
}
