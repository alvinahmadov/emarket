import { Injectable }   from '@angular/core';
import { Apollo }       from 'apollo-angular';
import { Observable }   from 'rxjs';
import { map, share }   from 'rxjs/operators';
import ProductsCategory from '@modules/server.common/entities/ProductsCategory';
import ApolloService    from '@modules/client.common.angular2/services/apollo.service';
import { GQLQuery }     from 'graphql/definitions';

@Injectable()
export class ProductsCategoryService extends ApolloService
{
	constructor(apollo: Apollo)
	{
		super(apollo,
		      {
			      serviceName:  "Merchant::ProductsCategoryService",
			      pollInterval: 2000
		      })
	}
	
	public getCategories(): Observable<ProductsCategory[]>
	{
		return this.apollo
		           .watchQuery<{
			           productsCategories: ProductsCategory[]
		           }>({
			              query:        GQLQuery.Category.GetAll,
			              pollInterval: this.pollInterval,
		              })
		           .valueChanges
		           .pipe(
				           map((result) => this.get(result)),
				           share()
		           );
	}
}
