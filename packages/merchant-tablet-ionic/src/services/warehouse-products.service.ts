import { Injectable }             from '@angular/core';
import { Apollo }                 from 'apollo-angular';
import { Observable }             from 'rxjs';
import { map }                    from 'rxjs/operators';
import IPagingOptions             from '@modules/server.common/interfaces/IPagingOptions';
import IWarehouseProduct,
{ IWarehouseProductCreateObject } from '@modules/server.common/interfaces/IWarehouseProduct';
import WarehouseProduct           from '@modules/server.common/entities/WarehouseProduct';
import ApolloService              from '@modules/client.common.angular2/services/apollo.service';
import { GQLQuery, GQLMutation }  from 'graphql/definitions';

@Injectable()
export class WarehouseProductsService extends ApolloService
{
	constructor(apollo: Apollo)
	{
		super(apollo, {
			serviceName:  "Merchant::WarehouseProductsService",
			pollInterval: 4000
		})
	}
	
	public getProductsWithPagination(
			storeId: string,
			pagingOptions?: IPagingOptions
	): Observable<WarehouseProduct[]>
	{
		return this.apollo
		           .watchQuery<{
			           warehouseProducts: WarehouseProduct[]
		           }>({
			              query:        GQLQuery.Store.Product.GetWithPagination,
			              pollInterval: this.pollInterval,
			              variables:    { storeId, pagingOptions },
		              })
		           .valueChanges
		           .pipe(map((result) => this.get(result)));
	}
	
	async getProductsCount(storeId: string): Promise<number>
	{
		return this.apollo
		           .query<{
			           count: number
		           }>({
			              query:     GQLQuery.Store.Product.Count,
			              variables: { storeId },
		              })
		           .pipe(map((result) => this.get(result)))
		           .toPromise();
	}
	
	public async getWarehouseProduct(
			storeId: string,
			storeProductId: string
	): Promise<WarehouseProduct>
	{
		return this.apollo
		           .query<{
			           res: WarehouseProduct
		           }>({
			              query:     GQLQuery.Store.Product.Get,
			              variables: { storeId, storeProductId },
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
	
	public async add(
			storeId: string,
			storeProducts: IWarehouseProductCreateObject[],
			triggerChange: boolean = true
	): Promise<WarehouseProduct[]>
	{
		return this.apollo
		           .mutate<{
			           products: IWarehouseProduct[]
		           }>({
			              mutation:  GQLMutation.Store.Product.Add,
			              variables: { storeId, storeProducts, triggerChange }
		              })
		           .pipe(
				           map((result) => <WarehouseProduct[]>this.factory(result, WarehouseProduct))
		           ).toPromise();
	}
	
	public async remove(
			storeId: string,
			storeProductIds: string[]
	): Promise<boolean>
	{
		console.debug(storeProductIds)
		return this.apollo
		           .mutate<{
			           res: boolean
		           }>({
			              mutation:  GQLMutation.Store.Product.Remove,
			              variables: { storeId, storeProductIds }
		              })
		           .pipe(map((result) => this.get(result)))
		           .toPromise();
	}
	
	public async update(
			storeId: string,
			storeProductId: string,
			updatedWarehouseProduct: WarehouseProduct
	): Promise<WarehouseProduct>
	{
		return this.apollo
		           .mutate<{
			           res: WarehouseProduct
		           }>({
			              mutation:  GQLMutation.Store.Product.Update,
			              variables: {
				              storeId,
				              storeProductId,
				              updateInput: updatedWarehouseProduct
			              }
		              })
		           .pipe(map((result) => this.get(result)))
		           .toPromise();
	}
	
	public async updateRating(
			storeId: string,
			storeProductId: string,
			customerId: string,
			count: number
	): Promise<WarehouseProduct>
	{
		return this.apollo
		           .mutate<{
			           wp: WarehouseProduct
		           }>({
			              mutation:  GQLMutation.Store.Product.UpdateRating,
			              variables: { storeId, storeProductId, customerId, count }
		              })
		           .pipe(map((result) => this.get(result)))
		           .toPromise();
	}
	
	public async updatePrice(
			storeId: string,
			storeProductId: string,
			price: number
	): Promise<WarehouseProduct>
	{
		return this.apollo
		           .mutate<{
			           res: WarehouseProduct
		           }>({
			              mutation:  GQLMutation.Store.Product.UpdatePrice,
			              variables: { storeId, storeProductId, price }
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
			storeProductId: string,
			isTakeaway: boolean
	): Promise<WarehouseProduct>
	{
		return this.apollo
		           .mutate<{
			           res: WarehouseProduct
		           }>({
			              mutation:  GQLMutation.Store.Product.UpdateTakeaway,
			              variables: { storeId, storeProductId, isTakeaway }
		              })
		           .pipe(map((result) => this.get(result)))
		           .toPromise();
	}
	
	public async changeProductDelivery(
			storeId: string,
			storeProductId: string,
			isDelivery: boolean
	): Promise<WarehouseProduct>
	{
		return this.apollo
		           .mutate<{
			           res: WarehouseProduct
		           }>({
			              mutation:  GQLMutation.Store.Product.UpdateDelivery,
			              variables: { storeId, storeProductId, isDelivery }
		              })
		           .pipe(map((result) => this.get(result)))
		           .toPromise();
	}
	
	public async increaseCount(
			storeId: string,
			storeProductId: string,
			count: number
	): Promise<WarehouseProduct>
	{
		return this.apollo
		           .mutate<{
			           res: WarehouseProduct
		           }>({
			              mutation:  GQLMutation.Store.Product.IncreaseCount,
			              variables: { storeId, storeProductId, count }
		              })
		           .pipe(map((result) => this.get(result)))
		           .toPromise();
	}
	
	public async increaseSoldCount(
			storeId: string,
			storeProductId: string,
			count: number
	): Promise<WarehouseProduct>
	{
		return this.apollo
		           .mutate<{
			           res: WarehouseProduct
		           }>({
			              mutation:  GQLMutation.Store.Product.IncreaseSoldCount,
			              variables: { storeId, storeProductId, count }
		              })
		           .pipe(map((result) => this.get(result)))
		           .toPromise();
	}
	
	public async decreaseCount(
			storeId: string,
			storeProductId: string,
			count: number
	): Promise<WarehouseProduct>
	{
		return this.apollo
		           .mutate<{
			           res: WarehouseProduct
		           }>({
			              mutation:  GQLMutation.Store.Product.DecreaseCount,
			              variables: { storeId, storeProductId, count }
		              })
		           .pipe(map((result) => this.get(result)))
		           .toPromise();
	}
	
	public async decreaseSoldCount(
			storeId: string,
			storeProductId: string,
			count: number
	): Promise<WarehouseProduct>
	{
		return this.apollo
		           .mutate<{
			           res: WarehouseProduct
		           }>({
			              mutation:  GQLMutation.Store.Product.DecreaseSoldCount,
			              variables: { storeId, storeProductId, count }
		              })
		           .pipe(map((result) => this.get(result)))
		           .toPromise();
	}
}
