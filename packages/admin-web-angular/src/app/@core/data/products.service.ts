import { Injectable }            from '@angular/core';
import { Apollo }                from 'apollo-angular';
import { Observable }            from 'rxjs';
import { map, share }            from 'rxjs/operators';
import { IProductCreateObject }  from '@modules/server.common/interfaces/IProduct';
import IPagingOptions            from '@modules/server.common/interfaces/IPagingOptions';
import Product                   from '@modules/server.common/entities/Product';
import ApolloService             from '@modules/client.common.angular2/services/apollo.service';
import { GQLQuery, GQLMutation } from 'graphql/definitions';

interface IRemovedObjectResponse
{
	n: number;
	ok: number;
}

@Injectable()
export class ProductsService extends ApolloService
{
	constructor(apollo: Apollo)
	{
		super(apollo,
		      {
			      serviceName:  "Admin::ProductsService",
			      pollInterval: 5000
		      });
	}
	
	public getProducts(
			pagingOptions?: IPagingOptions,
			existedProductsIds: string[] = []
	): Observable<Product[]>
	{
		return this.apollo
		           .watchQuery<{
			           products: Product[]
		           }>({
			              query:        GQLQuery.Product.GetAll,
			              variables:    { pagingOptions, existedProductsIds },
			              pollInterval: this.pollInterval,
		              })
		           .valueChanges
		           .pipe(
				           map((result) => this.get(result)),
				           share()
		           );
	}
	
	public create(product: IProductCreateObject): Observable<Product>
	{
		return this.apollo
		           .mutate<{
			           product: IProductCreateObject
		           }>({
			              mutation:  GQLMutation.Product.Create,
			              variables: {
				              product,
			              },
		              })
		           .pipe(
				           map((result) => <Product>
						           this.factory(result, Product)),
				           share()
		           );
	}
	
	public save(product: Product)
	{
		return this.apollo
		           .mutate<{
			           product: Product
		           }>({
			              mutation:  GQLMutation.Product.Save,
			              variables: {
				              product,
			              },
		              })
		           .pipe(
				           map((result) => this.get(result)),
				           share()
		           );
	}
	
	public removeByIds(ids: string[]): Observable<IRemovedObjectResponse>
	{
		return this.apollo
		           .mutate<{
			           response: IRemovedObjectResponse
		           }>({
			              mutation:  GQLMutation.Product.RemoveByIds,
			              variables: { ids },
		              })
		           .pipe(
				           map((result) => this.get(result)),
				           share()
		           );
	}
	
	public getProductById(id: string): Observable<Product | null>
	{
		return this.apollo
		           .query<{
			           product: Product
		           }>({
			              query:     GQLQuery.Product.GetById,
			              variables: { id },
		              })
		           .pipe(
				           map((result) => this.get(result)),
				           share()
		           );
	}
	
	public async getCountOfProducts(existedProductsIds: string[] = []): Promise<number>
	{
		return this.apollo
		           .query<{
			           count: number
		           }>({
			              query:     GQLQuery.Product.GetCount,
			              variables: { existedProductsIds },
		              })
		           .pipe(map((result) => this.get(result)))
		           .toPromise();
	}
}
