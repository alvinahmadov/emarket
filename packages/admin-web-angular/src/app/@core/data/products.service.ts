import { Injectable }               from '@angular/core';
import { Apollo }                   from 'apollo-angular';
import Product                      from '@modules/server.common/entities/Product';
import { IProductCreateObject }     from '@modules/server.common/interfaces/IProduct';
import { Observable }               from 'rxjs';
import { map, share }               from 'rxjs/operators';
import IPagingOptions               from '@modules/server.common/interfaces/IPagingOptions';
import { GQLMutations, GQLQueries } from "@modules/server.common/utilities/graphql";

interface RemovedObject
{
	n: number;
	ok: number;
}

@Injectable()
export class ProductsService
{
	constructor(private readonly apollo: Apollo) {}
	
	getProducts(
			pagingOptions?: IPagingOptions,
			existedProductsIds: string[] = []
	): Observable<Product[]>
	{
		return this.apollo
		           .watchQuery<{
			           products: Product[]
		           }>({
			              query: GQLQueries.ProductAll,
			              variables: { pagingOptions, existedProductsIds },
			              pollInterval: 2000,
		              })
		           .valueChanges.pipe(
						map((res) => res.data.products),
						share()
				);
	}
	
	create(product: IProductCreateObject): Observable<Product>
	{
		return this.apollo
		           .mutate<{
			           product: IProductCreateObject
		           }>({
			              mutation: GQLMutations.ProductCreate,
			              variables: {
				              product,
			              },
		              })
		           .pipe(
				           map((result: any) => result.data.createProduct),
				           share()
		           );
	}
	
	save(product: Product)
	{
		return this.apollo
		           .mutate<{
			           product: Product
		           }>({
			              mutation: GQLMutations.ProductSave,
			              variables: {
				              product,
			              },
		              })
		           .pipe(
				           map((result: any) => result.data.saveProduct),
				           share()
		           );
	}
	
	removeByIds(ids: string[]): Observable<RemovedObject>
	{
		return this.apollo
		           .mutate({
			                   mutation: GQLMutations.ProductRemoveByIds,
			                   variables: { ids },
		                   })
		           .pipe(
				           map((result: any) => result.data.removeProductsByIds),
				           share()
		           );
	}
	
	getProductById(id: string)
	{
		return this.apollo
		           .query({
			                  query: GQLQueries.ProductById,
			                  variables: { id },
		                  })
		           .pipe(
				           map((res) => res.data['product']),
				           share()
		           );
	}
	
	async getCountOfProducts(existedProductsIds: string[] = [])
	{
		const res = await this.apollo
		                      .query({
			                             query: GQLQueries.ProductCount,
			                             variables: { existedProductsIds },
		                             })
		                      .toPromise();
		
		return res.data['getCountOfProducts'];
	}
}
