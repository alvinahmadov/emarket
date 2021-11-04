import { Injectable }                    from '@angular/core';
import { Apollo }                        from 'apollo-angular';
import { Observable }                    from 'rxjs';
import { map, share }                    from 'rxjs/operators';
import { ProductLocalesService }         from '@modules/client.common.angular2/locale/product-locales.service';
import { IProductsCategoryCreateObject } from '@modules/server.common/interfaces/IProductsCategory';
import ProductsCategory                  from '@modules/server.common/entities/ProductsCategory';
import { CommonUtils }                   from '@modules/server.common/utilities';
import ApolloService                     from '@modules/client.common.angular2/services/apollo.service';
import { GQLMutation, GQLQuery }         from 'graphql/definitions';

interface IRemoveResponse
{
	n?: number
	ok?: number
}

@Injectable()
export class ProductsCategoryService extends ApolloService
{
	constructor(
			apollo: Apollo,
			private readonly productLocalesService: ProductLocalesService
	)
	{
		super(apollo,
		      {
			      serviceName:  "Admin::ProductsCategoryService",
			      pollInterval: 5000
		      });
	}
	
	public getCategories(): Observable<ProductsCategory[]>
	{
		return this.apollo
		           .watchQuery<{
			           productsCategories: ProductsCategory[]
		           }>({
			              query:        GQLQuery.ProductCategory.GetAllWithImage,
			              pollInterval: this.pollInterval,
		              })
		           .valueChanges.pipe(
						map((result) => this.get(result)),
						share()
				);
	}
	
	public create(
			productsCategory: IProductsCategoryCreateObject
	): Observable<ProductsCategory>
	{
		this.getDefaultImage(productsCategory);
		return this.apollo
		           .mutate<{
			           productsCategory: IProductsCategoryCreateObject
		           }>({
			              mutation:  GQLMutation.ProductCategory.Create,
			              variables: { productsCategory },
		              })
		           .pipe(
				           map((result) => <ProductsCategory>this.get(result)),
				           share()
		           );
	}
	
	public update(
			id: string,
			productsCategory: IProductsCategoryCreateObject
	): Observable<ProductsCategory>
	{
		this.getDefaultImage(productsCategory);
		return this.apollo
		           .mutate<{
			           productsCategory: IProductsCategoryCreateObject;
		           }>({
			              mutation:  GQLMutation.ProductCategory.Update,
			              variables: {
				              id,
				              productsCategory,
			              },
		              })
		           .pipe(
				           map((result) => <ProductsCategory>
						           this.factory(result, ProductsCategory)),
				           share()
		           );
	}
	
	public removeByIds(ids: string[]): Observable<IRemoveResponse>
	{
		return this.apollo
		           .mutate<{
			           response: IRemoveResponse
		           }>({
			              mutation:  GQLMutation.ProductCategory.RemoveByIds,
			              variables: { ids },
		              })
		           .pipe(
				           map((result) => this.get(result)),
				           share()
		           );
	}
	
	private getDefaultImage(data: IProductsCategoryCreateObject): void
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
