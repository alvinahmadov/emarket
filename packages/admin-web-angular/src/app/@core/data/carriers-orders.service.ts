import { Injectable } from '@angular/core';
import { Apollo }     from 'apollo-angular';
import { Observable } from 'rxjs';
import { map, share } from 'rxjs/operators';
import Order          from '@modules/server.common/entities/Order';
import ApolloService  from '@modules/client.common.angular2/services/apollo.service';
import { GQLQuery }   from 'graphql/definitions';

export interface IGeoLocationOrdersOptions
{
	sort?: string;
	skip?: number;
	limit?: number
}

@Injectable()
export class CarriersOrdersService extends ApolloService
{
	constructor(apollo: Apollo)
	{
		super(apollo,
		      {
			      serviceName:  "Admin::CarriersOrdersService",
			      pollInterval: 5000
		      });
	}
	
	public getCarrierOrdersHistory(
			carrierId: string,
			options: IGeoLocationOrdersOptions = {
				sort: 'asc',
			}
	): Observable<Order[]>
	{
		return this.apollo
		           .watchQuery<{
			           ordersHistory: Order[]
		           }>({
			              query:        GQLQuery.Carrier.Orders.GetHistory,
			              variables:    { carrierId, options },
			              pollInterval: this.pollInterval,
		              })
		           .valueChanges
		           .pipe(
				           map((res) => this.get(res)),
				           share()
		           );
	}
	
	public async getCountOfCarrierOrdersHistory(carrierId: string): Promise<number>
	{
		return this.apollo
		           .query<{
			           count: number
		           }>({
			              query:     GQLQuery.Carrier.Orders.GetHistoryCount,
			              variables: { carrierId },
		              })
		           .pipe(map((res) => this.get(res)))
		           .toPromise();
	}
}
