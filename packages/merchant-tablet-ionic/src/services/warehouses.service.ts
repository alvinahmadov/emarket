import { Injectable }                from '@angular/core';
import { Apollo }                    from 'apollo-angular';
import Warehouse                     from '@modules/server.common/entities/Warehouse';
import { map, share }                from 'rxjs/operators';
import { Observable }                from 'rxjs';
import IWarehouse                    from '@modules/server.common/interfaces/IWarehouse';
import IWarehouseProductCreateObject from '@modules/server.common/interfaces/IWarehouseProduct';
import GeoLocation                   from '@modules/server.common/entities/GeoLocation';
import IPagingOptions                from '@modules/server.common/interfaces/IPagingOptions';
import { GQLMutations, GQLQueries }  from '@modules/server.common/utilities/graphql';

@Injectable()
export class WarehousesService
{
	constructor(private readonly _apollo: Apollo) {}
	
	hasExistingStores(): Observable<boolean>
	{
		return this._apollo
		           .query<{
			           hasExistingStores: boolean
		           }>({ query: GQLQueries.WarehouseHasExistingStores })
		           .pipe(map((res) => res.data.hasExistingStores));
	}
	
	getCountExistingCustomers()
	{
		return this._apollo
		           .watchQuery<{
			           getCountExistingCustomers: { total; perStore };
		           }>({ query: GQLQueries.WarehouseExistingCustomersCount })
		           .valueChanges.pipe(
						map((res) => res.data.getCountExistingCustomers)
				);
	}
	
	getCountExistingCustomersToday()
	{
		return this._apollo
		           .watchQuery<{
			           getCountExistingCustomersToday: { total; perStore };
		           }>({ query: GQLQueries.WarehouseExistingCustomersTodayCount })
		           .valueChanges.pipe(
						map((res) => res.data.getCountExistingCustomersToday)
				);
	}
	
	getAllStores()
	{
		return this._apollo
		           .query<{
			           getAllStores: Warehouse[]
		           }>({ query: GQLQueries.StoreAllFull })
		           .pipe(map((res) => res.data.getAllStores));
	}
	
	getStores(pagingOptions?: IPagingOptions): Observable<Warehouse[]>
	{
		return this._apollo
		           .watchQuery<{
			           warehouses: IWarehouse[]
		           }>({
			              query: GQLQueries.WarehouseAll,
			              variables: { pagingOptions },
			              pollInterval: 5000,
		              })
		           .valueChanges.pipe(
						map((res) => res.data.warehouses),
						map((ws) => ws.map((w) => this._warehouseFactory(w))),
						share()
				);
	}
	
	getNearbyStores(geoLocation: GeoLocation): Observable<Warehouse[]>
	{
		return this._apollo
		           .watchQuery<{
			           nearbyStores: IWarehouse[]
		           }>({
			              query: GQLQueries.WarehouseNearbyStores,
			              pollInterval: 5000,
			              variables: { geoLocation },
		              })
		           .valueChanges.pipe(
						map((res) => res.data.nearbyStores),
						map((ws) => ws.map((w) => this._warehouseFactory(w))),
						share()
				);
	}
	
	removeByIds(ids: string[])
	{
		return this._apollo
		           .mutate({
			                   mutation: GQLMutations.WarehouseRemoveByIds,
			                   variables: { ids },
		                   });
	}
	
	addProducts(
			warehouseId: string,
			products: IWarehouseProductCreateObject[]
	)
	{
		return this._apollo
		           .mutate<{
			           warehouseId: string;
			           products: IWarehouseProductCreateObject[];
		           }>({
			              mutation: GQLMutations.WarehouseAddProducts,
			              variables: {
				              warehouseId,
				              products,
			              },
		              })
		           .pipe(
				           map((result) => result.data['warehouseAddProducts']),
				           share()
		           );
	}
	
	removeProductsById(warehouseId: string, productsIds: string[])
	{
		return this._apollo
		           .mutate({
			                   mutation: GQLMutations.WarehouseRemoveProducts,
			                   variables: { warehouseId, productsIds },
		                   });
	}
	
	getStoreById(id: string)
	{
		return this._apollo
		           .query({
			                  query: GQLQueries.WarehouseStoreById,
			                  variables: { id },
		                  })
		           .pipe(
				           map((res) => res.data['warehouse']),
				           share()
		           );
	}
	
	getWarehouseOrderProcess(id: string)
	{
		return this._apollo
		           .query({
			                  query: GQLQueries.WarehouseOrderProcess,
			                  variables: { id },
		                  })
		           .pipe(
				           map((res) => res.data['warehouse']),
				           share()
		           );
	}
	
	async getCountOfMerchants()
	{
		const res = await this._apollo
		                      .query({
			                             query: GQLQueries.WarehouseMerchantsCount,
		                             })
		                      .toPromise();
		
		return res.data['getCountOfMerchants'];
	}
	
	protected _warehouseFactory(warehouse: IWarehouse)
	{
		return warehouse == null ? null : new Warehouse(warehouse);
	}
}
