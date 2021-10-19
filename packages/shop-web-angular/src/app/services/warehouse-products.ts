import { Injectable } from '@angular/core';
import { Apollo }     from 'apollo-angular';
import { map }        from 'rxjs/operators';
import IPagingOptions from '@modules/server.common/interfaces/IPagingOptions';
import StoreProduct   from '@modules/server.common/entities/WarehouseProduct';
import ApolloService  from '@modules/client.common.angular2/services/apollo.service';
import { GQLQuery }   from 'graphql/definitions';

@Injectable()
export class WarehouseProductsService extends ApolloService
{
	constructor(apollo: Apollo)
	{
		super(apollo, {
			serviceName: "Shop::WarehouseProductsService",
			debug:       true
		});
	}
	
	public async getWarehouseProduct(
			storeId: string,
			productId: string
	): Promise<StoreProduct>
	{
		return this.apollo
		           .query<{
			           products: StoreProduct
		           }>({
			              query:     GQLQuery.Store.Product.Get,
			              variables: { storeId, productId },
		              })
		           .pipe(map((result) => this.get(result)))
		           .toPromise();
	}
	
	public async getWarehouseProducts(
			storeId: string,
			pagingOptions?: IPagingOptions
	): Promise<StoreProduct[]>
	{
		return this.apollo
		           .query<{
			           products: StoreProduct[]
		           }>({
			              query:     GQLQuery.Store.Product.GetWithPagination,
			              variables: { storeId, pagingOptions },
		              })
		           .pipe(map((result) => this.get(result)))
		           .toPromise();
		
	}
}
