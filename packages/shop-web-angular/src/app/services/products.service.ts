import { Injectable } from '@angular/core';
import { Apollo }     from 'apollo-angular';
import Product        from '@modules/server.common/entities/Product';
import ApolloService  from '@modules/client.common.angular2/services/apollo.service';
import { GQLQuery }   from 'graphql/definitions';
import { map }        from 'rxjs/operators';

interface IPagingSortInput
{
	field: string;
	sortBy: string;
}

interface IPagingOptions
{
	sort?: IPagingSortInput
	limit?: number
	skip?: number
}

export interface ITranslateInput
{
	locale: string;
	value: string;
}

export interface IProductsFindInput
{
	title?: ITranslateInput
	description?: ITranslateInput
	details?: ITranslateInput
	image?: IImageInput
}

export interface IImageInput
{
	locale: string
	url: string
	width: number
	height: number
	orientation: number
}

@Injectable()
export class ProductsService extends ApolloService
{
	constructor(apollo: Apollo)
	{
		super(apollo, {
			serviceName: "Shop::ProductsService"
		})
	}
	
	async getCountOfProducts(
			findInput?: any,
			existedProductsIds?: string[]
	)
	{
		const products = await this.getProducts(
				findInput,
				{},
				existedProductsIds
		);
		
		return products.length;
	}
	
	async getProducts(
			findInput?: IProductsFindInput,
			pagingOptions?: IPagingOptions,
			existedProductsIds?: string[]
	)
	{
		return this.apollo
		           .query<{
			           products: Product[]
		           }>({
			              query:     GQLQuery.Product.GetAll,
			              variables: { findInput, pagingOptions, existedProductsIds },
		              })
		           .pipe(map((result) => this.get(result)))
		           .toPromise();
	}
}
