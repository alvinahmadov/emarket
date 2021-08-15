import { Injectable } from '@angular/core';
import { Apollo }     from 'apollo-angular';
import Carrier        from '@modules/server.common/entities/Carrier';
import { map, share } from 'rxjs/operators';
import { Observable } from 'rxjs';
import ICarrier       from '@modules/server.common/interfaces/ICarrier';
import IPagingOptions from '@modules/server.common/interfaces/IPagingOptions';
import {
	GQLQueries,
	GQLMutations,
}                     from '@modules/server.common/utilities/graphql';

@Injectable()
export class CarriersService
{
	private readonly carriers$: Observable<Carrier[]>;
	
	constructor(private readonly _apollo: Apollo)
	{
		this.carriers$ = this._apollo
		                     .watchQuery<{
			                     getCarriers: ICarrier[]
		                     }>({
			                        query: GQLQueries.CarrierAll,
			                        pollInterval: 1000,
		                        })
		                     .valueChanges.pipe(
						map((res) => res.data.getCarriers),
						map((carriers) => carriers.map((c) => this._carrierFactory(c))),
						share()
				);
	}
	
	getAllCarriers(): Observable<Carrier[]>
	{
		return this.carriers$;
	}
	
	getCarriers(
			pagingOptions?: IPagingOptions,
			carriersFindInput?: any
	): Observable<Carrier[]>
	{
		return this._apollo
		           .watchQuery<{
			           getCarriers: ICarrier[]
		           }>({
			              query: GQLQueries.CarrierCarriersBy,
			              variables: { pagingOptions, carriersFindInput },
			              pollInterval: 2000,
		              })
		           .valueChanges.pipe(
						map((res) => res.data.getCarriers),
						map((carriers) => carriers.map((c) => this._carrierFactory(c))),
						share()
				);
	}
	
	removeByIds(ids: string[]): Observable<any>
	{
		return this._apollo
		           .mutate({
			                   mutation: GQLMutations.AdminRemoveCarriersByIds,
			                   variables: { ids },
		                   });
	}
	
	getCarrierByUsername(username: string): Observable<any>
	{
		return this._apollo
		           .query({
			                  query: GQLQueries.CarrierByUsername,
			                  variables: { username },
		                  })
		           .pipe(
				           map((res) => res.data['getCarrierByUsername']),
				           share()
		           );
	}
	
	getCarrierById(id: string): Observable<any>
	{
		return this._apollo
		           .query({
			                  query: GQLQueries.CarrierById,
			                  variables: { id },
		                  })
		           .pipe(
				           map((res) => res.data['getCarrier']),
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
	
	async getCountOfCarriers(carriersFindInput?: any): Promise<any>
	{
		const res = await this._apollo
		                      .query({
			                             query: GQLQueries.CarrierCount,
			                             variables: { carriersFindInput },
		                             })
		                      .toPromise();
		
		return res.data['getCountOfCarriers'];
	}
	
	protected _carrierFactory(carrier: ICarrier)
	{
		return carrier == null ? null : new Carrier(carrier);
	}
}
