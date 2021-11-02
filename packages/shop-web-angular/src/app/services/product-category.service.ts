import { Injectable }   from '@angular/core';
import { Apollo }       from 'apollo-angular';
import { Observable }   from 'rxjs';
import { map, share }   from 'rxjs/operators';
import ProductsCategory from '@modules/server.common/entities/ProductsCategory';
import ApolloService    from '@modules/client.common.angular2/services/apollo.service';
import { GQLQuery }     from 'graphql/definitions';

@Injectable()
export class ProductCategoryService extends ApolloService
{
	constructor(apollo: Apollo)
	{
		super(apollo,
		      { serviceName: "Shop::ProductsCategoryService" });
	}
	
	public getCategory(id: string): Observable<ProductsCategory>
	{
		return this.apollo
		           .query<{
			           category: ProductsCategory
		           }>({
			              query:     GQLQuery.Category.GetById,
			              variables: { id }
		              })
		           .pipe(map((result) => this.get(result)));
	}
	
	public getCategories(): Observable<ProductsCategory[]>
	{
		return this.apollo
		           .query<{
			           productsCategories: ProductsCategory[]
		           }>({
			              query: GQLQuery.Category.GetAllWithImage,
		              })
		           .pipe(
				           map((result) => this.get(result)),
				           share()
		           );
	}
}
