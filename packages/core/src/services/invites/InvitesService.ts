import Logger                                            from 'bunyan';
import { injectable }                                    from 'inversify';
import _                                                 from 'lodash';
import { Observable }                                    from 'rxjs';
import {
	concat,
	exhaustMap,
	filter,
	map,
	first,
	switchMap
}                                                        from 'rxjs/operators';
import { from }                                          from 'rxjs/observable/from';
import { of }                                            from 'rxjs/observable/of';
import { asyncListener, observableListener, routerName } from '@pyro/io';
import { DBService, ExistenceEventType }                 from '@pyro/db-server';
import { IInviteCreateObject }                           from '@modules/server.common/interfaces/IInvite';
import IEnterByCode                                      from '@modules/server.common/interfaces/IEnterByCode';
import IEnterByLocation                                  from '@modules/server.common/interfaces/IEnterByLocation';
import IPagingOptions                                    from '@modules/server.common/interfaces/IPagingOptions';
import IStreetLocation                                   from '@modules/server.common/interfaces/IStreetLocation';
import Invite                                            from '@modules/server.common/entities/Invite';
import IInviteRouter                                     from '@modules/server.common/routers/IInviteRouter';
import FakeDataUtils                                     from '@modules/server.common/utilities/fake-data';
import GeoUtils                                          from '@modules/server.common/utilities/geolocation';
import IService                                          from '../IService';
import { createLogger }                                  from '../../helpers/Log';
import { env }                                           from '../../env';

@injectable()
@routerName('invite')
export class InvitesService extends DBService<Invite>
		implements IInviteRouter, IService
{
	private static readonly InviteWorkingDistance = 50000;
	public readonly DBObject: any = Invite;
	protected readonly log: Logger = createLogger({
		                                              name: 'invitesService'
	                                              });
	protected _invitedStreetLocations: Observable<IStreetLocation[]>;
	
	constructor()
	{
		super();
		
		this._invitedStreetLocations = of(null).pipe(
				concat(this.existence),
				exhaustMap(() => this._getInvitedStreetLocations())
		);
	}
	
	@observableListener()
	public get(id: string)
	{
		return super.get(id)
		            .pipe(
				            map(async(invite) =>
				                {
					                await this.throwIfNotExists(id);
					                return invite;
				                }),
				            switchMap((invite) =>
				                      {
					                      return invite;
				                      })
		            );
	}
	
	@observableListener()
	public getInvitedStreetLocations()
	{
		return this._invitedStreetLocations;
	}
	
	@asyncListener()
	public create(invite: IInviteCreateObject): Promise<Invite>
	{
		if(!invite.code)
		{
			invite.code = FakeDataUtils.getRandomInt(1001, 9999).toString();
		}
		return super.create(invite);
	}
	
	@asyncListener()
	public getInvitesSettings(): Promise<{ isEnabled: boolean }>
	{
		return new Promise<{ isEnabled: boolean }>(
				(resolve) => resolve({ isEnabled: env.SETTING_INVITES_ENABLED })
		);
	}
	
	/**
	 * Get Invite by Code
	 * Warning: can emit null on start!
	 *
	 * @param {IEnterByCode} info
	 * @returns {(Observable<Invite | null>)}
	 * @memberof InvitesService
	 */
	@observableListener()
	public getByCode(info: IEnterByCode): Observable<Invite | null>
	{
		const findObject = {
			code: info.inviteCode
		};
		
		if(info.inviteCode !== env.FAKE_INVITE_CODE.toString())
		{
			findObject['geoLocation.loc'] = {
				$near: {
					$geometry: {
						type: 'Point',
						coordinates: info.location.coordinates
					},
					// $maxDistance: InvitesService.InviteWorkingDistance // 50Km distance for testing only!
				}
			};
		}
		
		return from(
				this.findOne({ ...findObject, isDeleted: { $eq: false } })
		).pipe(
				concat(
						this.existence
						    .pipe(
								    filter(
										    (event) => event.type !== ExistenceEventType.Removed
								    ),
								    map((event) => event.value as Invite),
								    filter((invite) =>
								           {
									           return (
											           GeoUtils.getLocDistance(
													           invite.geoLocation.loc,
													           info.location
											           ) <= InvitesService.InviteWorkingDistance &&
											           invite.code === info.inviteCode
									           );
								           })
						    )
				)
		);
	}
	
	/**
	 * Get Invite by Customer Location
	 *
	 * @param {IEnterByLocation} info
	 * @returns {(Observable<Invite | null>)}
	 * @memberof InvitesService
	 */
	@observableListener()
	public getByLocation(info: IEnterByLocation): Observable<Invite | null>
	{
		const findObject = {
			'geoLocation.city': info.city,
			'geoLocation.streetAddress': info.streetAddress,
			'geoLocation.house': info.house,
			'geoLocation.countryId': info.countryId,
			apartment: info.apartment
		};
		
		if(info.postcode != null)
		{
			findObject['geoLocation.postcode'] = info.postcode;
		}
		
		return from(
				this.findOne({ ...findObject, isDeleted: { $eq: false } })
		).pipe(
				concat(
						this.existence.pipe(
								filter(
										(event) => event.type !== ExistenceEventType.Removed
								),
								map((event) => event.value as Invite),
								filter((invite) =>
								       {
									       return (
											       invite.geoLocation.city === info.city &&
											       invite.geoLocation.streetAddress ===
											       info.streetAddress &&
											       invite.geoLocation.house === info.house &&
											       invite.geoLocation.countryId === info.countryId &&
											       invite.apartment === info.apartment
									       );
								       })
						)
				)
		);
	}
	
	@asyncListener()
	public async getInvites(
			findInput: any,
			pagingOptions: IPagingOptions
	): Promise<any>
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
	
	public async throwIfNotExists(inviteId: string)
	{
		const invite = await super.get(inviteId).pipe(first()).toPromise();
		
		if(!invite || invite.isDeleted)
		{
			throw Error(`Invite with id '${inviteId}' does not exists!`);
		}
	}
	
	private async _getInvitedStreetLocations(): Promise<IStreetLocation[]>
	{
		const results = await this.Model.aggregate()
		                          .group({
			                                 _id: {
				                                 streetAddress: '$geoLocation.streetAddress',
				                                 city: '$geoLocation.city',
				                                 country: '$geoLocation.countryId'
			                                 }
		                                 })
		                          .exec();
		
		return _.map(results, (result: { _id: IStreetLocation }) => result._id);
	}
}
