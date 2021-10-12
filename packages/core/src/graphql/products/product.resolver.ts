import { Resolver, Query, Mutation }                           from '@nestjs/graphql';
import { first }                                               from 'rxjs/operators';
import Product                                                 from '@modules/server.common/entities/Product';
import IWarehouseProduct                                       from '@modules/server.common/interfaces/IWarehouseProduct';
import { IProductDescription, IProductDetails, IProductTitle } from '@modules/server.common/interfaces/IProduct';
import { ProductsService }                                     from '../../services/products';
import {
	WarehousesService,
	WarehousesProductsService
}                                                              from '../../services/warehouses';

@Resolver('Product')
export class ProductResolver
{
	constructor(
			private readonly _productsService: ProductsService,
			private readonly _warehousesService: WarehousesService,
			private readonly _warehousesProductsService: WarehousesProductsService
	)
	{}
	
	@Query('product')
	async getProduct(_, { id }: { id: string })
	{
		return this._productsService.get(id).pipe(first()).toPromise();
	}
	
	@Query('products')
	async getProducts(
			_,
			{ findInput, pagingOptions = {}, existedProductsIds = [] }
	)
	{
		if(!pagingOptions || (pagingOptions && !pagingOptions['sort']))
		{
			pagingOptions['sort'] = { field: '_createdAt', sortBy: 'desc' };
		}
		
		const products = await this._productsService.getProducts(
				findInput,
				pagingOptions,
				existedProductsIds
		);
		
		return products.map((p) => new Product(p));
	}
	
	@Query()
	async getCountOfProducts(_, { existedProductsIds = [] })
	{
		return this._productsService.Model.find({
			                                        isDeleted: { $eq: false },
			                                        _id: { $nin: existedProductsIds }
		                                        })
		           .countDocuments()
		           .exec();
	}
	
	@Mutation()
	async removeProductsByIds(_, { ids }: { ids: string[] })
	{
		const warehouses = await this._warehousesService.find({
			                                                      isDeleted: { $eq: false }
		                                                      });
		const products = await this._productsService.find({
			                                                  _id:       { $in: ids },
			                                                  isDeleted: { $eq: false }
		                                                  });
		const productsIds = products.map((d) => d.id);
		
		for(const warehouse of warehouses)
		{
			const productsForDel = warehouse.products
			                                .filter((p) => productsIds.includes(p.productId))
			                                .map((p) => p.productId);
			
			if(productsForDel.length > 0)
			{
				await this._warehousesProductsService.remove(
						warehouse.id,
						productsForDel
				);
			}
		}
		
		await this._productsService.removeMultipleByIds(productsIds);
	}
	
	@Mutation()
	// @UseGuards(AuthGuard('jwt'))
	async saveProduct(_, { product }: { product })
	{
		const productId = product['_id'];
		await this._productsService.throwIfNotExists(productId);
		
		product.id = productId;
		return this._productsService.save(product);
	}
	
	@Mutation()
	async createProduct(_, { product }: { product })
	{
		return this._productsService.create(product);
	}
	
	private static filterBySearchText(wProduct: IWarehouseProduct, searchText: string)
	{
		if(!searchText)
		{
			return true;
		}
		
		let titles = wProduct.product['title'];
		titles = titles ? titles.map((t: IProductTitle) => t.value) : [];
		let descriptions = wProduct.product['description'];
		descriptions = descriptions
		               ? descriptions.map((d: IProductDescription) => d.value)
		               : [];
		let details = wProduct.product['details'];
		details = details ? details.map((d: IProductDetails) => d.value) : [];
		
		return (
				(titles &&
				 titles
						 .join()
						 .toLocaleLowerCase()
						 .includes(searchText.toLocaleLowerCase())) ||
				(descriptions &&
				 descriptions
						 .join()
						 .toLocaleLowerCase()
						 .includes(searchText.toLocaleLowerCase())) ||
				(details &&
				 details
						 .join()
						 .toLocaleLowerCase()
						 .includes(searchText.toLocaleLowerCase()))
		);
	}
}
