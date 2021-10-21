import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, share } from 'rxjs/operators';
import { Apollo }     from 'apollo-angular';
import ICarrier       from '@modules/server.common/interfaces/ICarrier';
import Carrier        from '@modules/server.common/entities/Carrier';
import Order          from '@modules/server.common/entities/Order';
import ApolloService  from '@modules/client.common.angular2/services/apollo.service';
import {
	GQLQuery,
	GQLMutation
}                     from 'graphql/definitions';

@Injectable()
export class CarrierService extends ApolloService
{
	private readonly carriers$: Observable<Carrier[]>
	
	constructor(apollo: Apollo)
	{
		super(apollo, {
			serviceName:  "Merchant::CarrierService",
			pollInterval: 4000
		})
		this.carriers$ = this.apollo
		                     .watchQuery<{
			                     getCarriers: ICarrier[]
		                     }>({
			                        query:        GQLQuery.Carrier.GetAll,
			                        pollInterval: this.pollInterval,
		                        })
		                     .valueChanges
		                     .pipe(
				                     map((result) => <Carrier[]>
						                     this.factory(result, Carrier)),
				                     share()
		                     );
	}
	
	public getAllCarriers(): Observable<Carrier[]>
	{
		return this.carriers$;
	}
	
	public updateCarrier(id: string, updateInput: any): Observable<Carrier>
	{
		return this.apollo
		           .mutate<{
			           updateCarrier: Carrier
		           }>({
			              mutation:  GQLMutation.Carrier.Update,
			              variables: {
				              id,
				              updateInput,
			              },
		              })
		           .pipe(
				           map((result) => this.get(result)),
				           share()
		           );
	}
	
	async getCarrierCurrentOrder(carrierId: string): Promise<Order>
	{
		return this.apollo
		           .query<{
			           currentOrder: Order
		           }>({
			              query:     GQLQuery.Carrier.GetCurrentOrder,
			              variables: { carrierId },
		              })
		           .pipe(map((result) => this.get(result)))
		           .toPromise();
	}
}
