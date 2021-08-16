import { Injectable }   from '@angular/core';
import { Apollo }       from 'apollo-angular';
import { map, share }   from 'rxjs/operators';
import Product          from '@modules/server.common/entities/Product';
import { GQLMutations } from '@modules/server.common/utilities/graphql'

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
}
