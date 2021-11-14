import { Query, Resolver }                 from '@nestjs/graphql';
import IOrder                              from '@modules/server.common/interfaces/IOrder';
import { ICarrierOrdersRouterGetOptions }  from '@modules/server.common/routers/ICarrierOrdersRouter';
import Order                               from '@modules/server.common/entities/Order';
import { IGeoLocationOrdersPagingOptions } from '@modules/server.common/routers/IGeoLocationOrdersRouter';
import { CarriersOrdersService }           from '../../services/carriers';

@Resolver('CarriersOrders')
export class CarriersOrdersResolver
{
	constructor(
			private readonly _carriersOrdersService: CarriersOrdersService
	)
	{}
	
	@Query('getCarrierOrders')
	async getCarrierOrders(
			_,
			{
				carrierId,
				options
			}: { carrierId: string; options: ICarrierOrdersRouterGetOptions }
	): Promise<IOrder[]>
	{
		return this._carriersOrdersService.getCarrierOrders(carrierId, options);
	}
	
	@Query('getCarrierCurrentOrder')
	async getCarrierCurrentOrder(
			_,
			{ carrierId }: { carrierId: string }
	): Promise<Order>
	{
		const dbOrder = await this._carriersOrdersService.getCarrierCurrentOrder(
				carrierId
		);
		return dbOrder !== null ? new Order(dbOrder) : null;
	}
	
	@Query('getCarrierOrdersHistory')
	async getCarrierOrdersHistory(
			_,
			{
				carrierId,
				options
			}: { carrierId: string; options: IGeoLocationOrdersPagingOptions }
	): Promise<Order[]>
	{
		return this._carriersOrdersService.getCarrierOrdersHistory(
				carrierId,
				options
		);
	}
	
	@Query('getCountOfCarrierOrdersHistory')
	async getCountOfCarrierOrdersHistory(
			_,
			{ carrierId }: { carrierId: string }
	): Promise<number>
	{
		return this._carriersOrdersService.getCountOfCarrierOrdersHistory(
				carrierId
		);
	}
}
