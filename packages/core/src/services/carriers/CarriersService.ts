import Logger                                from 'bunyan';
import { injectable }                        from 'inversify';
import { concat, Observable, of }            from 'rxjs';
import { exhaustMap, first, map, switchMap } from 'rxjs/operators';
import {
	asyncListener,
	observableListener,
	routerName,
	serialization
}                                            from '@pyro/io';
import { DBService }                         from '@pyro/db-server';
import IGeoLocation                          from '@modules/server.common/interfaces/IGeoLocation';
import IPagingOptions                        from '@modules/server.common/interfaces/IPagingOptions';
import ICarrierRouter                        from '@modules/server.common/routers/ICarrierRouter';
import CarrierStatus                         from '@modules/server.common/enums/CarrierStatus';
import Carrier                               from '@modules/server.common/entities/Carrier';
import GeoLocation                           from '@modules/server.common/entities/GeoLocation';
import IService                              from '../IService';
import { createLogger }                      from '../../helpers/Log';

@injectable()
@routerName('carrier')
export class CarriersService extends DBService<Carrier>
		implements ICarrierRouter, IService
{
	public readonly DBObject: any = Carrier;
	protected readonly log: Logger = createLogger({
		                                              name: 'carriersService'
	                                              });
	
	@observableListener()
	get(id: Carrier['id'])
	{
		return super.get(id).pipe(
				map(async(carrier) =>
				    {
					    await this.throwIfNotExists(id);
					    return carrier;
				    }),
				switchMap((carrier) =>
				          {
					          return carrier;
				          })
		);
	}
	
	@observableListener()
	getAllActive(): Observable<Carrier[]>
	{
		return concat(of(null), this.existence).pipe(
				exhaustMap(() => this._getAllActive())
		);
	}
	
	async getMultipleByIds(
			carrierIds: string[]
	): Promise<Observable<Carrier[]>>
	{
		const carriers = await this.find({
			                                 _id:       { $in: carrierIds },
			                                 isDeleted: { $eq: false }
		                                 });
		
		const carriersIdsToReturn = carriers.map((c) => c.id);
		return this.getMultiple(carriersIdsToReturn);
	}
	
	@asyncListener()
	async updateStatus(
			carrierId: Carrier['id'],
			status: CarrierStatus
	): Promise<Carrier>
	{
		await this.throwIfNotExists(carrierId);
		return super.update(carrierId, { status });
	}
	
	@asyncListener()
	async updateActivity(
			carrierId: Carrier['id'],
			isActive: boolean
	): Promise<Carrier>
	{
		await this.throwIfNotExists(carrierId);
		return super.update(carrierId, { isActive });
	}
	
	/**
	 * Update email for given Carrier (by carrier Id)
	 *
	 * @param {string} carrierId
	 * @param {string} email
	 * @returns {Promise<Carrier>}
	 * @memberof CarriersService
	 */
	@asyncListener()
	async updateEmail(carrierId: string, email: string): Promise<Carrier>
	{
		await this.throwIfNotExists(carrierId);
		return this.update(carrierId, { email });
	}
	
	@asyncListener()
	async updateGeoLocation(
			carrierId: Carrier['id'],
			@serialization((gl: IGeoLocation) => new GeoLocation(gl))
					geoLocation: GeoLocation
	): Promise<Carrier>
	{
		await this.throwIfNotExists(carrierId);
		return super.update(carrierId, { geoLocation });
	}
	
	@asyncListener()
	async updateById(
			id: Carrier['id'],
			updateObject: Partial<Carrier>
	): Promise<Carrier>
	{
		await this.throwIfNotExists(id);
		return super.update(id, updateObject);
	}
	
	async increaseNumberOfDeliveries(
			carrierId: Carrier['id'],
			n: number
	): Promise<Carrier>
	{
		await this.throwIfNotExists(carrierId);
		
		return super.update(carrierId, {
			$inc: { numberOfDeliveries: n }
		});
	}
	
	async throwIfNotExists(carrierId: string)
	{
		const carrier = await super.get(carrierId).pipe(first()).toPromise();
		
		if(!carrier || carrier.isDeleted)
		{
			throw Error(`Carrier with id '${carrierId}' does not exists!`);
		}
	}
	
	async getCarriers(findInput, pagingOptions: IPagingOptions)
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
	
	protected async _getAllActive()
	{
		return super.find({ isActive: true, isDeleted: { $eq: false } });
	}
}

export default CarriersService;
