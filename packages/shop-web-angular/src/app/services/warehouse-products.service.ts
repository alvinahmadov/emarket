// noinspection JSUnusedGlobalSymbols

import { Injectable }             from '@angular/core';
import { Apollo }                 from 'apollo-angular';
import { Observable }             from 'rxjs';
import { map }                    from 'rxjs/operators';
import IPagingOptions             from '@modules/server.common/interfaces/IPagingOptions';
import WarehouseProduct           from '@modules/server.common/entities/WarehouseProduct';
import ApolloService              from '@modules/client.common.angular2/services/apollo.service';
import { GQLMutation, GQLQuery }  from 'graphql/definitions';

@Injectable()
export class WarehouseProductsService extends ApolloService
{
	constructor(apollo: Apollo)
	{
		super(apollo, {
			serviceName: "Shop::WarehouseProductsService"
		});
	}
	
	public async getWarehouseProduct(
			storeId: string,
			productId: string
	): Promise<WarehouseProduct>
	{
		return this.apollo
		           .query<{
			           res: WarehouseProduct
		           }>({
			              query:     GQLQuery.Store.Product.Get,
			              variables: { storeId, productId },
		              })
		           .pipe(map((result) => this.get(result)))
		           .toPromise();
	}
	
	public getWarehouseProducts(
			storeId: string,
			pagingOptions?: IPagingOptions
	): Observable<WarehouseProduct[]>
	{
		return this.apollo
		           .query<{
			           res: WarehouseProduct[]
		           }>({
			              query:     GQLQuery.Store.Product.GetWithPagination,
			              variables: { storeId, pagingOptions },
		              })
		           .pipe(map((result) => this.get(result)));
	}
	
	public async getProductsCount(storeId: string): Promise<number>
	{
		return this.apollo
		           .query<{
			           count: number
		           }>({
			              query:     GQLQuery.Store.Product.Count,
			              variables: { warehouseId: storeId }
		              })
		           .pipe(map((result) => this.get(result)))
		           .toPromise()
	}
	
	public getAvailable(storeId: string): Observable<WarehouseProduct[]>
	{
		return this.apollo
		           .query<{
			           res: WarehouseProduct[]
		           }>({
			              query:     GQLQuery.Store.Product.GetAvailable,
			              variables: { storeId }
		              })
		           .pipe(map((result) => this.get(result)))
	}
	
	public getTopProducts(
			storeId: string,
			quantity: number
	): Observable<WarehouseProduct[]>
	{
		return this.apollo
		           .query<{
			           res: WarehouseProduct[]
		           }>({
			              query:     GQLQuery.Store.Product.GetTop,
			              variables: { storeId, quantity }
		              })
		           .pipe(map((result) => this.get(result)))
	}
	
	public async updateRating(
			storeId: string,
			productId: string,
			customerId: string,
			count: number
	): Promise<WarehouseProduct>
	{
		return this.apollo
		           .mutate<{
			           wp: WarehouseProduct
		           }>({
			              mutation:  GQLMutation.Store.Product.UpdateRating,
			              variables: { storeId, productId, customerId, count }
		              })
		           .pipe(map((result) => this.get(result)))
		           .toPromise();
	}
	
	public async updatePrice(
			storeId: string,
			productId: string,
			price: number
	): Promise<WarehouseProduct>
	{
		return this.apollo
		           .mutate<{
			           res: WarehouseProduct
		           }>({
			              mutation:  GQLMutation.Store.Product.UpdatePrice,
			              variables: { storeId, productId, price }
		              })
		           .pipe(map((result) => this.get(result)))
		           .toPromise();
	}
	
	public async changeProductAvailability(
			storeId: string,
			productId: string,
			isAvailable: boolean
	): Promise<WarehouseProduct>
	{
		return this.apollo
		           .mutate<{
			           res: WarehouseProduct
		           }>({
			              mutation:  GQLMutation.Store.Product.UpdateAvailability,
			              variables: { storeId, productId, isAvailable }
		              })
		           .pipe(map((result) => this.get(result)))
		           .toPromise();
	}
	
	public async changeProductTakeaway(
			storeId: string,
			productId: string,
			isTakeaway: boolean
	): Promise<WarehouseProduct>
	{
		return this.apollo
		           .mutate<{
			           res: WarehouseProduct
		           }>({
			              mutation:  GQLMutation.Store.Product.UpdateTakeaway,
			              variables: { storeId, productId, isTakeaway }
		              })
		           .pipe(map((result) => this.get(result)))
		           .toPromise();
	}
	
	public async changeProductDelivery(
			storeId: string,
			productId: string,
			isDelivery: boolean
	): Promise<WarehouseProduct>
	{
		return this.apollo
		           .mutate<{
			           res: WarehouseProduct
		           }>({
			              mutation:  GQLMutation.Store.Product.UpdateDelivery,
			              variables: { storeId, productId, isDelivery }
		              })
		           .pipe(map((result) => this.get(result)))
		           .toPromise();
	}
	
	public async increaseCount(
			storeId: string,
			productId: string,
			count: number
	): Promise<WarehouseProduct>
	{
		return this.apollo
		           .mutate<{
			           res: WarehouseProduct
		           }>({
			              mutation:  GQLMutation.Store.Product.IncreaseCount,
			              variables: { storeId, productId, count }
		              })
		           .pipe(map((result) => this.get(result)))
		           .toPromise();
	}
	
	public async increaseSoldCount(
			storeId: string,
			productId: string,
			count: number
	): Promise<WarehouseProduct>
	{
		return this.apollo
		           .mutate<{
			           res: WarehouseProduct
		           }>({
			              mutation:  GQLMutation.Store.Product.IncreaseSoldCount,
			              variables: { storeId, productId, count }
		              })
		           .pipe(map((result) => this.get(result)))
		           .toPromise();
	}
	
	public async increaseViewsCount(
			storeId: string,
			productId: string,
			count: number
	): Promise<WarehouseProduct>
	{
		return this.apollo
		           .mutate<{
			           res: WarehouseProduct
		           }>({
			              mutation:  GQLMutation.Store.Product.IncreaseViewsCount,
			              variables: { storeId, productId, count }
		              })
		           .pipe(map((result) => this.get(result)))
		           .toPromise();
	}
	
	public async decreaseCount(
			storeId: string,
			productId: string,
			count: number
	): Promise<WarehouseProduct>
	{
		return this.apollo
		           .mutate<{
			           res: WarehouseProduct
		           }>({
			              mutation:  GQLMutation.Store.Product.DecreaseCount,
			              variables: { storeId, productId, count }
		              })
		           .pipe(map((result) => this.get(result)))
		           .toPromise();
	}
	
	public async decreaseSoldCount(
			storeId: string,
			productId: string,
			count: number
	): Promise<WarehouseProduct>
	{
		return this.apollo
		           .mutate<{
			           res: WarehouseProduct
		           }>({
			              mutation:  GQLMutation.Store.Product.DecreaseSoldCount,
			              variables: { storeId, productId, count }
		              })
		           .pipe(map((result) => this.get(result)))
		           .toPromise();
	}
	
	public async decreaseViewsCount(
			storeId: string,
			productId: string,
			count: number
	): Promise<WarehouseProduct>
	{
		return this.apollo
		           .mutate<{
			           res: WarehouseProduct
		           }>({
			              mutation:  GQLMutation.Store.Product.DecreaseViewsCount,
			              variables: { storeId, productId, count }
		              })
		           .pipe(map((result) => this.get(result)))
		           .toPromise();
	}
}
