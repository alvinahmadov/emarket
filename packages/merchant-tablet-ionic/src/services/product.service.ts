import { Injectable }           from '@angular/core';
import { Apollo }               from 'apollo-angular';
import { Observable }           from 'rxjs';
import { map, share }           from 'rxjs/operators';
import { IProductCreateObject } from '@modules/server.common/interfaces/IProduct';
import Product                  from '@modules/server.common/entities/Product';
import ApolloService            from '@modules/client.common.angular2/services/apollo.service';
import { GQLMutation }          from '../graphql/definitions';

@Injectable()
export class ProductService extends ApolloService
{
	constructor(apollo: Apollo)
	{
		super(apollo,
		      {
			      serviceName: ProductService.name
		      });
	}
	
	public create(product: IProductCreateObject): Observable<Product>
	{
		return this.apollo
		           .mutate<{
			           product: Product
		           }>({
			              mutation:  GQLMutation.Store.CreateProduct,
			              variables: { product },
		              })
		           .pipe(
				           map((result) => this.get(result)),
				           share()
		           );
	}
	
	public save(product: Product): Observable<Product>
	{
		return this.apollo
		           .mutate<{
			           product: Product
		           }>({
			              mutation:  GQLMutation.Store.SaveProduct,
			              variables: { product },
		              })
		           .pipe(
				           map((result) => <Product>
						           this.factory(result, Product)),
				           share()
		           );
	}
}
