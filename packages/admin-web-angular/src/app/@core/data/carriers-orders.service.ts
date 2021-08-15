import { Injectable } from '@angular/core';
import { Apollo }     from 'apollo-angular';
import Order          from '@modules/server.common/entities/Order';
import { map, share } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { GQLQueries } from '@modules/server.common/utilities/graphql';

@Injectable()
export class CarriersOrdersService
{
	constructor(private readonly apollo: Apollo) {}
	
	getCarrierOrdersHistory(
			carrierId: string,
			options: { sort?: string; skip?: number; limit?: number } = {
				sort: 'asc',
			}
	): Observable<Order[]>
	{
		return this.apollo
		           .watchQuery<{
			           getCarrierOrdersHistory: Order[]
		           }>({
			              query: GQLQueries.CarrierOrdersHistory,
			              variables: { carrierId, options },
			              pollInterval: 2000,
		              })
		           .valueChanges.pipe(
						map((res) => res.data.getCarrierOrdersHistory),
						share()
				);
	}
	
	async getCountOfCarrierOrdersHistory(carrierId: string)
	{
		const res = await this.apollo
		                      .query({
			                             query: GQLQueries.CarrierOrdersHistoryCount,
			                             variables: { carrierId },
		                             })
		                      .toPromise();
		
		return res.data['getCountOfCarrierOrdersHistory'];
	}
}
