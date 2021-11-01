import { Mutation, Resolver, Query }     from '@nestjs/graphql';
import { Observable }                    from 'rxjs';
import { first, map, share }             from 'rxjs/operators';
import { IWarehouseProductCreateObject } from '@modules/server.common/interfaces/IWarehouseProduct';
import WarehouseProduct                  from '@modules/server.common/entities/WarehouseProduct';
import ProductInfo                       from '@modules/server.common/entities/ProductInfo';
import { WarehousesProductsService }     from '../../services/warehouses';

export type TWarehouseProductInput = {
	warehouseId: string;
	warehouseProductId: string;
}

export type TWarehouseProductsInput = {
	warehouseId: string;
	products: IWarehouseProductCreateObject[];
}

export type TWarehouseProductIdsInput = {
	warehouseId: string;
	productsIds: string[];
}

export type TQuantityUpdateInput = {
	increase: number;
	decrease: number;
	to: number;
}

export type TWarehouseProductUpdateInput = {
	warehouseId: string;
	productId: string;
	updateInput: {
		quantity: TQuantityUpdateInput;
		price: number;
	};
}

@Resolver('Warehouse-products')
export class WarehouseProductsResolver
{
	constructor(
			private readonly _warehousesProductsService: WarehousesProductsService
	)
	{}
	
	@Query()
	async getWarehouseProductsWithPagination(_, { storeId, pagingOptions = {} }): Promise<WarehouseProduct[]>
	{
		const warehouseProducts = await this._warehousesProductsService.getProductsWithPagination(
				storeId,
				pagingOptions
		);
		
		return warehouseProducts.map((p) => new WarehouseProduct(p));
	}
	
	@Query()
	async getWarehouseProductsCount(_, { id }: { id: string }): Promise<number>
	{
		return this._warehousesProductsService.getProductsCount(id);
	}
	
	@Query()
	async getWarehouseProduct(
			_,
			{
				warehouseId,
				warehouseProductId
			}: TWarehouseProductInput
	): Promise<WarehouseProduct>
	{
		return await this._warehousesProductsService
		                 .getProduct(warehouseId, warehouseProductId)
		                 .pipe(first())
		                 .toPromise();
	}
	
	@Query()
	getWarehouseProductInfo(
			_,
			{
				warehouseId
			}: { warehouseId: string }
	): Observable<ProductInfo>
	{
		return this._warehousesProductsService
		           .getAvailable(warehouseId)
		           .pipe(
				           map(warehouseProducts =>
				               {
					               return _.map(warehouseProducts, (warehouseProduct: WarehouseProduct) =>
					               {
						               return new ProductInfo({
							                                      warehouseId:   warehouseId,
							                                      warehouseLogo: '',
							                                      warehouseProduct,
							                                      distance:      100000
						                                      });
					               })
				               }),
				           share()
		           )
	}
	
	@Mutation()
	async addWarehouseProducts(
			_,
			{
				warehouseId,
				products
			}: TWarehouseProductsInput
	): Promise<WarehouseProduct[]>
	{
		return this._warehousesProductsService.add(warehouseId, products);
	}
	
	@Mutation()
	async removeWarehouseProducts(
			_,
			{
				warehouseId,
				productsIds
			}: TWarehouseProductIdsInput
	): Promise<WarehouseProduct[]>
	{
		return this._warehousesProductsService.remove(warehouseId, productsIds);
	}
	
	@Mutation()
	async updateWarehouseProduct(
			_,
			{
				warehouseId,
				productId,
				updateInput
			}: TWarehouseProductUpdateInput
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
					          warehouseId,
					          productId,
					          updateInput.quantity.increase
			          );
		}
		
		await this._warehousesProductsService
		          .changePrice(warehouseId, productId, updateInput.price);
	}
}
