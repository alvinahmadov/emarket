import { Injectable }   from '@angular/core';
import { Apollo }       from 'apollo-angular';
import { Observable }   from 'rxjs';
import { map }          from 'rxjs/operators';
import IPagingOptions   from '@modules/server.common/interfaces/IPagingOptions';
import WarehouseProduct from '@modules/server.common/entities/WarehouseProduct';
import { GQLQueries }   from '@modules/server.common/utilities/graphql';

@Injectable()
export class WarehouseProductsService
{
	constructor(private readonly _apollo: Apollo) {}
	
	getProductsWithPagination(
			id: string,
			pagingOptions?: IPagingOptions
	): Observable<WarehouseProduct[]>
	{
		return this._apollo
		           .watchQuery<{
			           productsCategories: WarehouseProduct[]
		           }>({
			              query: GQLQueries.WarehouseProductProductsWithPagination,
			              pollInterval: 2000,
			              variables: { id, pagingOptions },
		              })
		           .valueChanges.pipe(
						map((res) => res.data['getProductsWithPagination'])
				);
	}
	
	async getProductsCount(id: string)
	{
		const res = await this._apollo
		                      .query({
			                             query: GQLQueries.WarehouseProductProductsCount,
			                             variables: { id },
		                             })
		                      .toPromise();
		
		return res.data['getProductsCount'];
	}
}
