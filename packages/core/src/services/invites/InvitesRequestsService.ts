import Logger                                            from 'bunyan';
import Bluebird                                          from 'bluebird';
import faker                                             from 'faker';
import _                                                 from 'lodash';
import { inject, injectable }                            from 'inversify';
import { filter, first, map, switchMap }                 from 'rxjs/operators';
import { Subscription }                                  from 'rxjs/Subscription';
import requestPromise                                    from 'request-promise';
import { asyncListener, observableListener, routerName } from '@pyro/io';
import { DBService, ExistenceEventType }                 from '@pyro/db-server';
import { IInviteRequestCreateObject }                    from '@modules/server.common/interfaces/IInviteRequest';
import ILanguage                                         from '@modules/server.common/interfaces/ILanguage';
import Device                                            from '@modules/server.common/entities/Device';
import Country                                           from "@modules/server.common/enums/Country";
import InviteRequest                                     from '@modules/server.common/entities/InviteRequest';
import Invite                                            from '@modules/server.common/entities/Invite';
import { IGeoLocationCreateObject }                      from '@modules/server.common/interfaces/IGeoLocation';
import IPagingOptions                                    from '@modules/server.common/interfaces/IPagingOptions';
import IInviteRequestRouter                              from '@modules/server.common/routers/IInviteRequestRouter';
import { launched }                                      from '@modules/server.common/notifications';
import { InvitesService }                                from './InvitesService';
import IService                                          from '../IService';
import { DevicesService }                                from '../devices';
import { createLogger }                                  from '../../helpers/Log';
import { env }                                           from '../../env';

@injectable()
@routerName('invite-request')
export class InvitesRequestsService extends DBService<InviteRequest>
		implements IInviteRequestRouter, IService
{
	public readonly DBObject: any = InviteRequest;
	protected readonly log: Logger = createLogger({
		                                              name: 'invitesRequestsService'
	                                              });
	
	protected pushSendingInvitesSubscription: Subscription = Subscription.EMPTY;
	
	constructor(
			@inject(InvitesService) protected invitesService: InvitesService,
			@inject(DevicesService) protected devicesService: DevicesService
	)
	{
		super();
		
		this.pushSendingInvitesSubscription =
				this.invitesService
				    .existence
				    .pipe(
						    filter(
								    (existenceEvent) =>
										    existenceEvent.type === ExistenceEventType.Created
						    ),
						    map((existenceEvent) => existenceEvent.value as Invite)
				    )
				    .subscribe(
						    async(invite) =>
						    {
							    interface AggregateResult
							    {
								    _id: string; // deviceId
								    createdAt: string;
							    }
							
							    const results: AggregateResult[] =
									    await this.Model
									              .aggregate()
									              .sort({
										                    channelId: 1,
										                    _createdAt: 1
									                    })
									              .group({
										                     _id: '$deviceId',
										                     createdAt: { $last: '$_createdAt' }
									                     })
									              .exec();
							
							    if(results.length > 0)
							    {
								    await this.notifyAboutLaunch(
										    invite,
										    _.map(results, (result) => result._id)
								    );
							    }
						    }
				    );
	}
	
	@observableListener()
	get(id: string)
	{
		return super.get(id)
		            .pipe(
				            map(async(inviteReq) =>
				                {
					                await this.throwIfNotExists(id);
					                return inviteReq;
				                }),
				            switchMap((inviteReq) => inviteReq)
		            );
	}
	
	@asyncListener()
	async create(
			inviteRequest: IInviteRequestCreateObject
	): Promise<InviteRequest>
	{
		return super.create(inviteRequest);
	}
	
	@asyncListener()
	async notifyAboutLaunch(
			invite: Invite,
			devicesIds: string[]
	): Promise<void>
	{
		const devices = await (
				await this.devicesService
				          .getMultipleDevices(devicesIds)
		).pipe(first())
		 .toPromise();
		
		const devicesByLanguages = _.groupBy(
				devices,
				(device) => device.language
		);
		const languages = _.keys(devicesByLanguages) as ILanguage[];
		
		await (<any>Bluebird).map(languages, async(language: ILanguage) =>
		{
			const devicesByLanguage: Device[] = devicesByLanguages[language];
			
			const request = {
				audience: this._getLaunchAudience(devicesByLanguage),
				device_types: 'all',
				notification: InvitesRequestsService._getLaunchNotification(language, invite)
			};
			
			try
			{
				const rp: any = requestPromise;
				
				await rp({
					         method: 'POST',
					         uri: 'https://go.urbanairship.com/api/push',
					         body: request,
					         headers: {
						         Accept: 'application/vnd.urbanairship+json; version=3;'
					         },
					         auth: {
						         user: env.URBAN_AIRSHIP_KEY,
						         pass: env.URBAN_AIRSHIP_SECRET
					         },
					         json: true
				         });
			} catch(e)
			{
				console.error(`.notifyAboutLaunch(...) error: ${e.message}`);
				throw e;
			}
		});
	}
	
	@asyncListener()
	async getInvitesRequests(
			findInput: any,
			invited: boolean,
			pagingOptions: IPagingOptions
	): Promise<any>
	{
		const sortObj = {};
		
		const findNotInvited = {
			...findInput,
			isDeleted: { $eq: false },
			isInvited: { $eq: false }
		};
		
		if(pagingOptions.sort)
		{
			sortObj[pagingOptions.sort.field] = pagingOptions.sort.sortBy;
		}
		
		const inviteRequests = await this.Model.find(findNotInvited)
		                                 .sort(sortObj)
		                                 .skip(pagingOptions.skip)
		                                 .limit(pagingOptions.limit)
		                                 .lean()
		                                 .exec();
		
		const allNotInvitedCount = await this.Model.find(findNotInvited)
		                                     .countDocuments()
		                                     .exec();
		
		const skipInvited =
				pagingOptions.skip + inviteRequests.length - allNotInvitedCount;
		
		if(invited && skipInvited >= 0)
		{
			const invitedFromDB = await this.Model
			                                .find({
				                                      ...findInput,
				                                      isDeleted: { $eq: false },
				                                      isInvited: { $eq: true }
			                                      })
			                                .sort({ invitedDate: 'desc' })
			                                .skip(skipInvited)
			                                .limit(pagingOptions.limit - inviteRequests.length)
			                                .lean()
			                                .exec();
			
			return [...inviteRequests, ...invitedFromDB];
		}
		
		return inviteRequests;
	}
	
	async throwIfNotExists(inviteRequestId: string)
	{
		const inviteRequest = await super.get(inviteRequestId)
		                                 .pipe(first())
		                                 .toPromise();
		
		if(!inviteRequest || inviteRequest.isDeleted)
		{
			throw Error(
					`Invite request with id '${inviteRequestId}' does not exists!`
			);
		}
	}
	
	async generateInviteRequests(defaultLng: number, defaultLat: number, qty: number = 1000)
	{
		const invitesRequestsToCreate: IInviteRequestCreateObject[] = [];
		
		let inviteRequestsCount = 1;
		
		while(inviteRequestsCount <= qty)
		{
			const houseNumber = `${inviteRequestsCount}`;
			
			const requestLocation = InvitesRequestsService._getInviteRequestGeoLocationCreateObj(
					houseNumber,
					defaultLng,
					defaultLat
			);
			
			invitesRequestsToCreate.push({
				                             isInvited: false,
				                             apartment: `${inviteRequestsCount}`,
				                             geoLocation: requestLocation
			                             });
			
			inviteRequestsCount += 1;
		}
		
		await this.Model.insertMany(invitesRequestsToCreate);
	}
	
	private _getLaunchAudience(devices: Device[])
	{
		const audience: {
			or: Array<| { ios_channel: string[] | string }
			          | { android_channel: string[] | string }>;
		} = {
			or: []
		};
		
		const ios_devices = _.filter(
				devices, device => device.type === 'ios'
		);
		
		if(ios_devices.length > 0)
		{
			audience.or.push({
				                 ios_channel: ios_devices
						                 .map((device) => device.channelId)
						                 .filter((channelId) => channelId != null)
						                 .map((channelId) => channelId as string)
			                 });
		}
		
		const android_devices = _.filter(
				devices,
				(device) => device.type === 'android'
		);
		
		if(android_devices.length > 0)
		{
			audience.or.push({
				                 android_channel: android_devices
						                 .map((device) => device.channelId)
						                 .filter((channelId) => channelId != null)
						                 .map((channelId) => channelId as string)
			                 });
		}
		
		return audience;
	}
	
	private static _getLaunchNotification(language: ILanguage, invite: Invite): any
	{
		switch(language)
		{
			case 'en-US':
				return {
					android: {
						title: 'Market just launched!',
						alert: 'Click to see some available products.',
						extra: {
							event: launched,
							invite: JSON.stringify(invite)
						}
					},
					ios: {
						alert: 'Market just launched at your address. Have fun!',
						extra: {
							event: launched,
							invite: JSON.stringify(invite)
						}
					}
				};
			case 'ru-RU':
			default:
				return {
					android: {
						title: 'Market ???????????? ?????? ????????????????????!',
						alert: '???????????????? ?????????? ?????????????? ?????????????????? ????????????????.',
						extra: {
							event: launched,
							invite: JSON.stringify(invite)
						}
					},
					ios: {
						alert:
								'Market ???????????? ?????? ???????????????????? ???? ???????????? ????????????. ??????????!',
						extra: {
							event: launched,
							invite: JSON.stringify(invite)
						}
					}
				};
		}
	}
	
	private static _getInviteRequestGeoLocationCreateObj(
			houseNumber: string,
			defaultLng: number,
			defaultLat: number
	): IGeoLocationCreateObject
	{
		return {
			countryId: faker.random.number(Country.ZW) as Country,
			city: faker.address.city(),
			house: houseNumber,
			loc: {
				type: 'Point',
				coordinates: [defaultLng, defaultLat]
			},
			streetAddress: faker.address.streetAddress()
		};
	}
}
