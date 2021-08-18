import { Injectable }           from '@angular/core';
import { Apollo }               from 'apollo-angular';
import { Observable }           from 'rxjs';
import { map, share }           from 'rxjs/operators';
import Product                  from '@modules/server.common/entities/Product';
import { GQLMutations }         from '@modules/server.common/utilities/graphql'
import { IProductCreateObject } from "@modules/server.common/interfaces/IProduct";

@Injectable()
export class ProductService
{
	constructor(private readonly apollo: Apollo) {}
	
	save(product: Product)
	{
		return this.apollo
		           .mutate<{
			           product: Product
		           }>(
				           {
					           mutation: GQLMutations.WarehouseSaveProduct,
					           variables: {
						           product,
					           },
				           }
		           ).pipe(
						map((result) => result.data.product),
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
}
