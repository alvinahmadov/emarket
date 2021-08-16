import { Injectable }               from '@angular/core';
import { Apollo }                   from 'apollo-angular';
import { IPromotionCreateObject }   from '@modules/server.common/interfaces/IPromotion';
import { GQLMutations, GQLQueries } from '@modules/server.common/utilities/graphql';
import { map, share }               from 'rxjs/operators';
import { Observable }               from 'rxjs';

@Injectable()
export class PromotionService
{
	constructor(private readonly apollo: Apollo) {}
	
	getAll(findInput: { warehouse: string }): Observable<any>
	{
		return this.apollo
		           .query<any>({
			                       query: GQLQueries.PromotionAll,
			                       variables: { findInput },
		                       })
		           .pipe(
				           map((result) => result.data || []),
				           share()
		           );
	}
	
	create(promotion: IPromotionCreateObject)
	{
		return this.apollo
		           .mutate<{
			           promotion: IPromotionCreateObject
		           }>({
			              mutation: GQLMutations.PromotionCreate,
			              variables: {
				              promotion,
			              },
		              })
		           .pipe(
				           map((result) => result.data),
				           share()
		           );
	}
	
	update(id: String, promotion: IPromotionCreateObject)
	{
		return this.apollo
		           .mutate<{
			           promotion: IPromotionCreateObject
		           }>({
			              mutation: GQLMutations.PromotionUpdate,
			              variables: {
				              id,
				              promotion,
			              },
		              })
		           .pipe(
				           map((result) => result.data),
				           share()
		           );
	}
	
	removeByIds(ids: string[])
	{
		return this.apollo
		           .mutate({
			                   mutation: GQLMutations.PromotionRemoveByIds,
			                   variables: { ids },
		                   });
	}
}
