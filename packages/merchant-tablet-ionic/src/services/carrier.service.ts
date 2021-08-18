import { Injectable } from '@angular/core';
import { Apollo }     from 'apollo-angular';
import Carrier        from '@modules/server.common/entities/Carrier';
import { Observable } from 'rxjs';
import { map, share } from 'rxjs/operators';
import ICarrier       from '@modules/server.common/interfaces/ICarrier';
import {
	GQLQueries,
	GQLMutations
}                     from '@modules/server.common/utilities/graphql';

@Injectable()
export class CarrierService
{
	private carriers$: Observable<Carrier[]>
	
	constructor(private readonly _apollo: Apollo)
	{
		this.carriers$ = this._apollo
		                     .watchQuery<{
			                     getCarriers: ICarrier[]
		                     }>({
			                        query: GQLQueries.CarrierAll,
			                        pollInterval: 1000,
		                        })
		                     .valueChanges
		                     .pipe(
				                     map((res) => res.data.getCarriers),
				                     map((carriers) => carriers.map((c) => this._carrierFactory(c))),
				                     share()
		                     );
	}
	
	getAllCarriers(): Observable<Carrier[]>
	{
		return this.carriers$;
	}
	
	updateCarrier(id: string, updateInput: any)
	{
		return this._apollo
		           .mutate<{
			           updateCarrier: Carrier
		           }>({
			              mutation: GQLMutations.CarrierUpdate,
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
	
	async getCarrierCurrentOrder(carrierId: string): Promise<any>
	{
		const res = await this._apollo
		                      .query({
			                             query: GQLQueries.CarrierCurrentOrder,
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
