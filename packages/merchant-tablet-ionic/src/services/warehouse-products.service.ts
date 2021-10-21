import { Injectable }   from '@angular/core';
import { Apollo }       from 'apollo-angular';
import { Observable }   from 'rxjs';
import { map }          from 'rxjs/operators';
import IPagingOptions   from '@modules/server.common/interfaces/IPagingOptions';
import WarehouseProduct from '@modules/server.common/entities/WarehouseProduct';
import ApolloService    from '@modules/client.common.angular2/services/apollo.service';
import { GQLQuery }     from 'graphql/definitions';

@Injectable()
export class WarehouseProductsService extends ApolloService
{
	constructor(apollo: Apollo)
	{
		super(apollo, {
			serviceName:  "Merchant::WarehouseProductsService",
			pollInterval: 4000
		})
	}
	
	public getProductsWithPagination(
			storeId: string,
			pagingOptions?: IPagingOptions
	): Observable<WarehouseProduct[]>
	{
		return this.apollo
		           .watchQuery<{
			           warehouseProducts: WarehouseProduct[]
		           }>({
			              query:        GQLQuery.Store.Product.GetWithPagination,
			              pollInterval: this.pollInterval,
			              variables:    { storeId, pagingOptions },
		              })
		           .valueChanges
		           .pipe(map((result) => this.get(result)));
	}
	
	async getProductsCount(storeId: string): Promise<number>
	{
		return this.apollo
		           .query<{
			           count: number
		           }>({
			              query:     GQLQuery.Store.Product.Count,
			              variables: { storeId },
		              })
		           .pipe(map((result) => this.get(result)))
		           .toPromise();
	}
}
