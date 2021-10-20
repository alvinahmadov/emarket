import { Injectable }            from '@angular/core';
import { Apollo }                from 'apollo-angular';
import { Observable }            from 'rxjs';
import { map, share }            from 'rxjs/operators';
import ICarrier                  from '@modules/server.common/interfaces/ICarrier';
import IPagingOptions            from '@modules/server.common/interfaces/IPagingOptions';
import Carrier                   from '@modules/server.common/entities/Carrier';
import Order                     from '@modules/server.common/entities/Order';
import ApolloService             from '@modules/client.common.angular2/services/apollo.service';
import { GQLMutation, GQLQuery } from 'graphql/definitions';

@Injectable()
export class CarriersService extends ApolloService
{
	private readonly carriers$: Observable<Carrier[]>;
	
	constructor(apollo: Apollo)
	{
		super(apollo,
		      {
			      serviceName:  CarriersService.name,
			      pollInterval: 3000
		      });
		this.carriers$ = this.apollo
		                     .watchQuery<{
			                     carriers: ICarrier[]
		                     }>({
			                        query:        GQLQuery.Carrier.GetAll,
			                        pollInterval: this.pollInterval,
		                        })
		                     .valueChanges
		                     .pipe(
				                     map((res) => <Carrier[]>
						                     this.factory(res, Carrier)),
				                     share()
		                     );
	}
	
	public getAllCarriers(): Observable<Carrier[]>
	{
		return this.carriers$;
	}
	
	public getCarriers(
			pagingOptions?: IPagingOptions,
			carriersFindInput?: any
	): Observable<Carrier[]>
	{
		return this.apollo
		           .watchQuery<{
			           carriers: ICarrier[]
		           }>({
			              query:        GQLQuery.Carrier.Find,
			              variables:    {
				              pagingOptions,
				              carriersFindInput
			              },
			              pollInterval: this.pollInterval,
		              })
		           .valueChanges
		           .pipe(
				           map((result) => <Carrier[]>
						           this.factory(result, Carrier)),
				           share()
		           );
	}
	
	public removeByIds(ids: string[]): Observable<any>
	{
		return this.apollo
		           .mutate({
			                   mutation:  GQLMutation.Carrier.RemoveByIds,
			                   variables: { ids },
		                   });
	}
	
	public getCarrierByUsername(username: string): Observable<Carrier | null>
	{
		return this.apollo
		           .query<{
			           carrier: Carrier
		           }>({
			              query:     GQLQuery.Carrier.GetByUsername,
			              variables: { username },
		              })
		           .pipe(
				           map((result) => this.get(result)),
				           share()
		           );
	}
	
	public getCarrierById(id: string): Observable<Carrier | null>
	{
		return this.apollo
		           .query<{
			           carrier: Carrier
		           }>({
			              query:     GQLQuery.Carrier.GetById,
			              variables: { id },
		              })
		           .pipe(
				           map((result) => this.get(result)),
				           share()
		           );
	}
	
	public async getCarrierCurrentOrder(carrierId: string): Promise<Order | null>
	{
		return this.apollo
		           .query<{
			           order: Order
		           }>({
			              query:     GQLQuery.Carrier.GetCurrentOrder,
			              variables: { carrierId },
		              })
		           .pipe(map((result) => this.get(result)))
		           .toPromise();
	}
	
	public async getCountOfCarriers(carriersFindInput?: any): Promise<number>
	{
		return this.apollo
		           .query<{
			           count: number
		           }>({
			              query:     GQLQuery.Carrier.Count,
			              variables: { carriersFindInput },
		              })
		           .pipe(map(result => this.get(result)))
		           .toPromise();
	}
}
