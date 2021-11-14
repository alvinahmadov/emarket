import { Resolver, Query }           from '@nestjs/graphql';
import {
	IGeoLocationWorkOrderInput,
	IGeoLocationWorkOrdersInput
}                                    from '@modules/server.common/routers/IGeoLocationOrdersRouter';
import Order                         from '@modules/server.common/entities/Order';
import { GeoLocationsOrdersService } from '../../../services/geo-locations/GeoLocationsOrdersService';

@Resolver('GeoLocationOrders')
export class GeoLocationOrdersResolver
{
	constructor(public geoLocationsOrdersService: GeoLocationsOrdersService) {}
	
	@Query('getOrderForWork')
	public async getOrderForWork(
			_,
			{
				geoLocation,
				skippedOrderIds,
				options,
				searchObj
			}: IGeoLocationWorkOrderInput
	): Promise<Order>
	{
		const orders = await this.geoLocationsOrdersService.getOrdersForWork(
				geoLocation,
				skippedOrderIds,
				options,
				searchObj
		);
		
		return orders[0];
	}
	
	@Query('getOrdersForWork')
	public async getOrdersForWork(
			_,
			{
				geoLocation,
				skippedOrderIds,
				options,
				searchObj
			}: IGeoLocationWorkOrdersInput
	): Promise<Order[]>
	{
		const orders = await this.geoLocationsOrdersService.getOrdersForWork(
				geoLocation,
				skippedOrderIds,
				options,
				searchObj
		);
		
		return orders.map((o) => new Order(o));
	}
	
	@Query()
	public async getCountOfOrdersForWork(
			_,
			{
				geoLocation,
				skippedOrderIds,
				searchObj
			}: Omit<IGeoLocationWorkOrderInput, 'options'>
	): Promise<number>
	{
		return this.geoLocationsOrdersService.getCountOfOrdersForWork(
				geoLocation,
				skippedOrderIds,
				searchObj
		);
	}
}
