import { Injectable }                    from '@angular/core';
import { Apollo }                        from 'apollo-angular';
import { Observable }                    from 'rxjs';
import { map, share }                    from 'rxjs/operators';
import { ProductLocalesService }         from '@modules/client.common.angular2/locale/product-locales.service';
import { IProductsCategoryCreateObject } from '@modules/server.common/interfaces/IProductsCategory';
import ProductsCategory                  from '@modules/server.common/entities/ProductsCategory';
import { CommonUtils }                   from '@modules/server.common/utilities';
import { GQLMutations, GQLQueries }      from '@modules/server.common/utilities/graphql';

@Injectable()
export class ProductsCategoryService
{
	constructor(
			private readonly apollo: Apollo,
			private readonly productLocalesService: ProductLocalesService
	)
	{}
	
	getCategories(): Observable<ProductsCategory[]>
	{
		return this.apollo
		           .watchQuery<{
			           productsCategories: ProductsCategory[]
		           }>({
			              query: GQLQueries.ProductCategoryAllWithImage,
			              pollInterval: 1000,
		              })
		           .valueChanges.pipe(
						map((res) => res.data.productsCategories),
						share()
				);
	}
	
	create(
			productsCategory: IProductsCategoryCreateObject
	): Observable<ProductsCategory>
	{
		this.getDefaultImage(productsCategory);
		return this.apollo
		           .mutate<{
			           productsCategory: IProductsCategoryCreateObject
		           }>({
			              mutation: GQLMutations.ProductCategoryCreate,
			              variables: {
				              productsCategory,
			              },
		              })
		           .pipe(
				           map((result: any) => result.data.createProductsCategory),
				           share()
		           );
	}
	
	update(
			id: string,
			productsCategory: IProductsCategoryCreateObject
	): Observable<ProductsCategory>
	{
		this.getDefaultImage(productsCategory);
		return this.apollo
		           .mutate<{
			           id: string;
			           productsCategory: IProductsCategoryCreateObject;
		           }>({
			              mutation: GQLMutations.ProductCategoryUpdate,
			              variables: {
				              id,
				              productsCategory,
			              },
		              })
		           .pipe(
				           map((result: any) => result.data.updateProductsCategory),
				           share()
		           );
	}
	
	removeByIds(ids: string[])
	{
		return this.apollo
		           .mutate({
			                   mutation: GQLMutations.ProductsCategoryRemoveByIds,
			                   variables: { ids },
		                   });
	}
	
	private getDefaultImage(data: IProductsCategoryCreateObject)
	{
		if(!data.image)
		{
			data.image = CommonUtils.getDummyImage(
					300,
					300,
					this.productLocalesService
					    .getTranslate(data.name)
					    .charAt(0)
					    .toUpperCase()
			);
		}
	}
}
