import { Mutation, Resolver, Query }     from '@nestjs/graphql';
import { Observable }                    from 'rxjs';
import { first, map, share }             from 'rxjs/operators';
import { IWarehouseProductCreateObject } from '@modules/server.common/interfaces/IWarehouseProduct';
import WarehouseProduct                  from '@modules/server.common/entities/WarehouseProduct';
import ProductInfo                       from '@modules/server.common/entities/ProductInfo';
import { WarehousesProductsService }     from '../../services/warehouses';

export interface IStoreInput
{
	storeId: string
}

export interface IWarehouseProductInput extends IStoreInput
{
	storeProductId: string;
}

export interface IWarehouseProductCountInput extends IWarehouseProductInput
{
	count: number
}

export interface IWarehouseProductsInput extends IStoreInput
{
	storeProducts: IWarehouseProductCreateObject[];
}

export interface IWarehouseProductIdsInput extends IStoreInput
{
	storeProductsIds: string[];
}

export interface IWarehouseProductAvailableInput extends IWarehouseProductInput
{
	isAvailable: boolean;
}

export interface IWarehouseProductTakeawayInput extends IWarehouseProductInput
{
	isTakeaway: boolean;
}

export interface IWarehouseProductDeliveryInput extends IWarehouseProductInput
{
	isDelivery: boolean;
}

export interface IWarehouseProductsTopInput extends IStoreInput
{
	quantity: number;
}

export interface IWarehouseProductPriceInput extends IWarehouseProductInput
{
	price: number
}

export interface IWarehouseProductRatingInput extends IWarehouseProductCountInput
{
	customerId: string,
}

export interface IWarehouseProductUpdateInput extends IWarehouseProductInput
{
	updateInput: {
		quantity: IQuantityUpdateInput;
		price: number;
	};
}

export interface IQuantityUpdateInput
{
	increase: number;
	decrease: number;
	to: number;
}

@Resolver('Warehouse-products')
export class WarehouseProductsResolver
{
	constructor(
			private readonly _warehousesProductsService: WarehousesProductsService
	)
	{}
	
	@Query()
	public async getWarehouseProduct(
			_,
			{
				storeId,
				storeProductId
			}: IWarehouseProductInput
	): Promise<WarehouseProduct>
	{
		return await this._warehousesProductsService
		                 .getProduct(storeId, storeProductId)
		                 .pipe(first())
		                 .toPromise();
	}
	
	@Query()
	public getWarehouseProductInfo(_, { storeId }: IStoreInput): Observable<ProductInfo>
	{
		return this._warehousesProductsService
		           .getAvailable(storeId)
		           .pipe(
				           map(warehouseProducts =>
				               {
					               return _.map(warehouseProducts, (warehouseProduct: WarehouseProduct) =>
					               {
						               return new ProductInfo({
							                                      warehouseId:   storeId,
							                                      warehouseLogo: '',
							                                      warehouseProduct,
							                                      distance:      100000
						                                      });
					               })
				               }),
				           share()
		           )
	}
	
	@Query()
	public async getWarehouseProductsWithPagination(
			_,
			{
				storeId,
				pagingOptions = {}
			}
	): Promise<WarehouseProduct[]>
	{
		const warehouseProducts = await this._warehousesProductsService.getProductsWithPagination(
				storeId,
				pagingOptions
		);
		
		return warehouseProducts.map((p) => new WarehouseProduct(p));
	}
	
	@Query()
	public async getWarehouseProductsCount(_, { storeId }: IStoreInput): Promise<number>
	{
		return this._warehousesProductsService.getProductsCount(storeId);
	}
	
	@Query()
	public async getWarehouseProductsAvailable(_, { storeId }: IStoreInput): Promise<WarehouseProduct[]>
	{
		return this._warehousesProductsService.getAvailable(storeId).toPromise();
	}
	
	@Query()
	public async getWarehouseProductsTop(
			_,
			{
				storeId,
				quantity
			}: IWarehouseProductsTopInput
	): Promise<WarehouseProduct[]>
	{
		return this._warehousesProductsService
		           .getTopProducts(storeId, quantity)
		           .toPromise();
	}
	
	@Mutation()
	public async addWarehouseProducts(
			_,
			{
				storeId,
				storeProducts
			}: IWarehouseProductsInput
	): Promise<WarehouseProduct[]>
	{
		return this._warehousesProductsService.add(storeId, storeProducts);
	}
	
	@Mutation()
	public async removeWarehouseProducts(
			_,
			{
				storeId,
				storeProductsIds
			}: IWarehouseProductIdsInput
	): Promise<WarehouseProduct[]>
	{
		return this._warehousesProductsService.remove(storeId, storeProductsIds);
	}
	
	@Mutation()
	public async updateWarehouseProduct(
			_,
			{
				storeId,
				storeProductId,
				updateInput
			}: IWarehouseProductUpdateInput
	): Promise<void>
	{
		if(updateInput.quantity)
		{
			if(Object.keys(updateInput.quantity).length !== 1)
			{
				throw new Error();
			}
			
			await this._warehousesProductsService
			          .increaseCount(
					          storeId,
					          storeProductId,
					          updateInput.quantity.increase
			          );
		}
		
		await this._warehousesProductsService
		          .changePrice(storeId, storeProductId, updateInput.price);
	}
	
	@Mutation()
	public async changeWarehouseProductAvailability(
			_,
			{
				storeId,
				storeProductId,
				isAvailable
			}: IWarehouseProductAvailableInput
	): Promise<WarehouseProduct>
	{
		return this._warehousesProductsService
		           .changeProductAvailability(storeId, storeProductId, isAvailable);
	}
	
	@Mutation()
	public async changeWarehouseProductTakeaway(
			_,
			{
				storeId,
				storeProductId,
				isTakeaway
			}: IWarehouseProductTakeawayInput
	): Promise<WarehouseProduct>
	{
		return this._warehousesProductsService
		           .changeProductTakeaway(storeId, storeProductId, isTakeaway);
	}
	
	@Mutation()
	public async changeWarehouseProductDelivery(
			_,
			{
				storeId,
				storeProductId,
				isDelivery
			}: IWarehouseProductDeliveryInput
	): Promise<WarehouseProduct>
	{
		return this._warehousesProductsService
		           .changeProductDelivery(storeId, storeProductId, isDelivery);
	}
	
	@Mutation()
	public changeWarehouseProductRating(
			_,
			{
				storeId,
				storeProductId,
				customerId,
				count
			}: IWarehouseProductRatingInput
	): Promise<WarehouseProduct>
	{
		return this._warehousesProductsService
		           .changeRate(storeId, storeProductId, customerId, count);
	}
	
	@Mutation()
	public changeWarehouseProductPrice(
			_,
			{
				storeId,
				storeProductId,
				price
			}: IWarehouseProductPriceInput
	): Promise<WarehouseProduct>
	{
		return this._warehousesProductsService
		           .changePrice(storeId, storeProductId, price);
	}
	
	@Mutation()
	public async increaseWarehouseProductCount(
			_,
			{
				storeId,
				storeProductId,
				count
			}: IWarehouseProductCountInput
	): Promise<WarehouseProduct>
	{
		return this._warehousesProductsService
		           .increaseCount(storeId, storeProductId, count);
	}
	
	@Mutation()
	public async increaseWarehouseProductSoldCount(
			_,
			{
				storeId,
				storeProductId,
				count
			}: IWarehouseProductCountInput
	): Promise<WarehouseProduct>
	{
		return this._warehousesProductsService
		           .increaseSoldCount(storeId, storeProductId, count);
	}
	
	@Mutation()
	public async increaseWarehouseProductViewsCount(
			_,
			{
				storeId,
				storeProductId,
				count
			}: IWarehouseProductCountInput
	): Promise<WarehouseProduct>
	{
		return this._warehousesProductsService
		           .increaseViewsCount(storeId, storeProductId, count);
	}
	
	@Mutation()
	public async decreaseWarehouseProductCount(
			_,
			{
				storeId,
				storeProductId,
				count
			}: IWarehouseProductCountInput
	): Promise<WarehouseProduct>
	{
		return this._warehousesProductsService
		           .decreaseCount(storeId, storeProductId, count);
	}
	
	@Mutation()
	public async decreaseWarehouseProductSoldCount(
			_,
			{
				storeId,
				storeProductId,
				count
			}: IWarehouseProductCountInput
	): Promise<WarehouseProduct>
	{
		return this._warehousesProductsService
		           .decreaseSoldCount(storeId, storeProductId, count);
	}
	
	@Mutation()
	public async decreaseWarehouseProductViewsCount(
			_,
			{
				storeId,
				storeProductId,
				count
			}: IWarehouseProductCountInput
	): Promise<WarehouseProduct>
	{
		return this._warehousesProductsService
		           .decreaseViewsCount(storeId, storeProductId, count);
	}
}
