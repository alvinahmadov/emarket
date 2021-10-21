import { Injectable }            from '@angular/core';
import { Apollo }                from 'apollo-angular';
import { Observable }            from 'rxjs';
import { map, share }            from 'rxjs/operators';
import {
	IPromotionCreateObject,
	IPromotionsFindInput
}                                from '@modules/server.common/interfaces/IPromotion';
import Promotion                 from '@modules/server.common/entities/Promotion';
import ApolloService             from '@modules/client.common.angular2/services/apollo.service';
import { GQLQuery, GQLMutation } from 'graphql/definitions';

interface IRemovePromotionResponse
{
	n?: number
	ok?: number
}

@Injectable()
export class PromotionService extends ApolloService
{
	constructor(apollo: Apollo)
	{
		super(apollo,
		      { serviceName: "Merchant::PromotionService" });
	}
	
	public getPromotions(findInput: IPromotionsFindInput): Observable<Promotion[]>
	{
		return this.apollo
		           .query<{
			           promotions: Promotion[]
		           }>({
			              query:     GQLQuery.Promotion.GetAll,
			              variables: { findInput },
		              })
		           .pipe(
				           map((result) => this.get(result) || []),
				           share()
		           );
	}
	
	public create(promotion: IPromotionCreateObject): Observable<Promotion>
	{
		return this.apollo
		           .mutate<{
			           promotion: IPromotionCreateObject
		           }>({
			              mutation:  GQLMutation.Promotion.Create,
			              variables: {
				              promotion,
			              },
		              })
		           .pipe(
				           map((result) => <Promotion>
						           this.factory(result, Promotion)),
				           share()
		           );
	}
	
	public update(id: String, promotion: IPromotionCreateObject): Observable<Promotion>
	{
		return this.apollo
		           .mutate<{
			           promotion: IPromotionCreateObject
		           }>({
			              mutation:  GQLMutation.Promotion.Update,
			              variables: {
				              id,
				              promotion,
			              },
		              })
		           .pipe(
				           map((result) => <Promotion>
						           this.factory(result, Promotion)),
				           share()
		           );
	}
	
	public removeByIds(ids: string[]): Observable<IRemovePromotionResponse>
	{
		return this.apollo
		           .mutate<{
			           response: IRemovePromotionResponse
		           }>({
			              mutation:  GQLMutation.Promotion.RemoveByIds,
			              variables: { ids },
		              })
		           .pipe(map((result) => this.get(result)));
	}
}
