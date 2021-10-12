import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, share } from 'rxjs/operators';
import { Apollo }     from 'apollo-angular';
import ICarrier       from '@modules/server.common/interfaces/ICarrier';
import Carrier        from '@modules/server.common/entities/Carrier';
import Order          from '@modules/server.common/entities/Order';
import {
	GQLQueries,
	GQLMutations
}                     from '@modules/server.common/utilities/graphql';

@Injectable()
export class CarrierService
{
	private readonly carriers$: Observable<Carrier[]>
	private static readonly pollInterval = 10000;
	
	constructor(private readonly _apollo: Apollo)
	{
		this.carriers$ = this._apollo
		                     .watchQuery<{
			                     getCarriers: ICarrier[]
		                     }>({
			                        query:        GQLQueries.CarrierAll,
			                        pollInterval: CarrierService.pollInterval,
		                        })
		                     .valueChanges
		                     .pipe(
				                     map((res) => res.data.getCarriers),
				                     map((carriers) => carriers.map((c) => this._carrierFactory(c))),
				                     share()
		                     );
	}
	
	public getAllCarriers(): Observable<Carrier[]>
	{
		return this.carriers$;
	}
	
	public updateCarrier(id: string, updateInput: any): Observable<Carrier>
	{
		return this._apollo
		           .mutate<{
			           updateCarrier: Carrier
		           }>({
			              mutation:  GQLMutations.CarrierUpdate,
			              variables: {
				              id,
				              updateInput,
			              },
		              })
		           .pipe(
				           map((result) => result.data.updateCarrier),
				           share()
		           );
	}
	
	async getCarrierCurrentOrder(carrierId: string): Promise<Order>
	{
		const res = await this._apollo
		                      .query({
			                             query:     GQLQueries.CarrierCurrentOrder,
			                             variables: { carrierId },
		                             })
		                      .toPromise();
		
		return res.data['getCarrierCurrentOrder'];
	}
	
	protected _carrierFactory(carrier: ICarrier)
	{
		return carrier == null ? null : new Carrier(carrier);
	}
}
