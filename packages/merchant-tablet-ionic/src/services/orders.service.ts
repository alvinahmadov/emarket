import { Injectable } from '@angular/core';
import { Apollo }     from 'apollo-angular';
import { map, share } from 'rxjs/operators';
import Order          from '@modules/server.common/entities/Order';
import { GQLQueries } from '@modules/server.common/utilities/graphql';
import { Observable } from 'rxjs';

@Injectable()
export class OrdersService
{
	constructor(private readonly _apollo: Apollo) {}
	
	getOrderedUsersInfo(storeId: string)
	{
		return this._apollo
		           .watchQuery({
			                       query: GQLQueries.OrderOrderedUsersInfo,
			                       variables: { storeId },
			                       pollInterval: 1000,
		                       })
		           .valueChanges.pipe(
						map((res) => res.data['getOrderedUsersInfo']),
						share()
				);
	}
	
	getOrders(): Observable<Order[]>
	{
		return this._apollo
		           .watchQuery<{
			           orders: Order[]
		           }>({
			              query: GQLQueries.OrderOrders,
			              pollInterval: 4000,
		              })
		           .valueChanges.pipe(
						map((res) => res.data.orders),
						share()
				);
	}
}
