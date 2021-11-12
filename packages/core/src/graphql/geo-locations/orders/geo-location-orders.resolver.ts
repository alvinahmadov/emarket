import { Resolver, Query }           from '@nestjs/graphql';
import Order                         from '@modules/server.common/entities/Order';
import { GeoLocationsOrdersService } from '../../../services/geo-locations/GeoLocationsOrdersService';
import {
	IGeoLocationWorkOrderInput,
	IGeoLocationWorkOrdersInput
}                                    from '../../../services/geo-locations/GeoLocationOrdersOptions';

@Resolver('GeoLocationOrders')
export class GeoLocationOrdersResolver
{
	constructor(public geoLocationsOrdersService: GeoLocationsOrdersService) {}
	
	@Query('getOrderForWork')
	async getOrderForWork(
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
	async getOrdersForWork(
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
	async getCountOfOrdersForWork(
			_,
			{
				geoLocation,
				skippedOrderIds,
				searchObj
			}: Omit<IGeoLocationWorkOrdersInput, 'options'>
	): Promise<number>
	{
		return this.geoLocationsOrdersService.getCountOfOrdersForWork(
				geoLocation,
				skippedOrderIds,
				searchObj
		);
	}
}
