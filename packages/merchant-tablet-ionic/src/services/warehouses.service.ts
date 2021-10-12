import { Injectable }                from '@angular/core';
import { Apollo }                    from 'apollo-angular';
import Warehouse                     from '@modules/server.common/entities/Warehouse';
import { map, share }                from 'rxjs/operators';
import { Observable }                from 'rxjs';
import IPagingOptions                from '@modules/server.common/interfaces/IPagingOptions';
import IWarehouse                    from '@modules/server.common/interfaces/IWarehouse';
import IWarehouseProductCreateObject from '@modules/server.common/interfaces/IWarehouseProduct';
import GeoLocation                   from '@modules/server.common/entities/GeoLocation';
import WarehouseProduct              from '@modules/server.common/entities/WarehouseProduct';
import { GQLMutations, GQLQueries }  from '@modules/server.common/utilities/graphql';

export interface ICustomersByStore
{
	storeId: string;
	customersCount: number;
}

export interface IExistingCustomersByStores
{
	total: any;
	perStore: ICustomersByStore[];
}

@Injectable()
export class WarehousesService
{
	constructor(private readonly _apollo: Apollo) {}
	
	public hasExistingStores(): Observable<boolean>
	{
		return this._apollo
		           .query<{
			           hasExistingStores: boolean
		           }>({
			              query: GQLQueries.WarehouseHasExistingStores
		              })
		           .pipe(map((res) => res.data.hasExistingStores));
	}
	
	public getCountExistingCustomers(): Observable<IExistingCustomersByStores>
	{
		return this._apollo
		           .watchQuery<{
			           getCountExistingCustomers: { total; perStore };
		           }>({ query: GQLQueries.WarehouseExistingCustomersCount })
		           .valueChanges.pipe(
						map((res) => res.data.getCountExistingCustomers)
				);
	}
	
	// noinspection JSUnusedGlobalSymbols
	public getCountExistingCustomersToday(): Observable<IExistingCustomersByStores>
	{
		return this._apollo
		           .watchQuery<{
			           getCountExistingCustomersToday: { total; perStore };
		           }>({ query: GQLQueries.WarehouseExistingCustomersTodayCount })
		           .valueChanges.pipe(
						map((res) => res.data.getCountExistingCustomersToday)
				);
	}
	
	public getAllStores(): Observable<Warehouse[]>
	{
		return this._apollo
		           .query<{
			           getAllStores: Warehouse[]
		           }>({ query: GQLQueries.WarehouseAllFull })
		           .pipe(map((res) => res.data.getAllStores));
	}
	
	public getStores(pagingOptions?: IPagingOptions): Observable<Warehouse[]>
	{
		return this._apollo
		           .watchQuery<{
			           warehouses: IWarehouse[]
		           }>({
			              query:        GQLQueries.WarehousesAllWithPagination,
			              variables:    { pagingOptions },
			              pollInterval: 5000,
		              })
		           .valueChanges.pipe(
						map((res) => res.data.warehouses),
						map((ws) => ws.map((w) => this._warehouseFactory(w))),
						share()
				);
	}
	
	public getNearbyStores(geoLocation: GeoLocation): Observable<Warehouse[]>
	{
		return this._apollo
		           .watchQuery<{
			           nearbyStores: IWarehouse[]
		           }>({
			              query:        GQLQueries.WarehousesNearby,
			              pollInterval: 5000,
			              variables:    { geoLocation },
		              })
		           .valueChanges.pipe(
						map((res) => res.data.nearbyStores),
						map((ws) => ws.map((w) => this._warehouseFactory(w))),
						share()
				);
	}
	
	public removeByIds(ids: string[]): Observable<any>
	{
		return this._apollo
		           .mutate({
			                   mutation:  GQLMutations.WarehouseRemoveByIds,
			                   variables: { ids },
		                   });
	}
	
	public addProducts(
			warehouseId: string,
			products: IWarehouseProductCreateObject[]
	): Observable<WarehouseProduct[]>
	{
		return this._apollo
		           .mutate<{
			           warehouseId: string;
			           products: IWarehouseProductCreateObject[];
		           }>({
			              mutation:  GQLMutations.WarehouseAddProducts,
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
	
	public removeProductsById(warehouseId: string, productsIds: string[]): Observable<any>
	{
		return this._apollo
		           .mutate({
			                   mutation:  GQLMutations.WarehouseRemoveProducts,
			                   variables: { warehouseId, productsIds },
		                   });
	}
	
	public getStoreById(id: string): Observable<Warehouse>
	{
		return this._apollo
		           .query({
			                  query:     GQLQueries.Warehouse,
			                  variables: { id },
		                  })
		           .pipe(
				           map((res) => res.data['warehouse']),
				           share()
		           );
	}
	
	public getWarehouseOrderProcess(id: string): Observable<Warehouse>
	{
		return this._apollo
		           .query({
			                  query:     GQLQueries.WarehouseOrderProcess,
			                  variables: { id },
		                  })
		           .pipe(
				           map((res) => res.data['warehouse']),
				           share()
		           );
	}
	
	public async getCountOfMerchants(): Promise<number>
	{
		return this._apollo
		           .query({
			                  query: GQLQueries.WarehouseMerchantsCount,
		                  })
		           .pipe(
				           map((res) => res.data['getCountOfMerchants']),
				           share()
		           )
		           .toPromise();
	}
	
	protected _warehouseFactory(warehouse: IWarehouse): Warehouse | null
	{
		return warehouse == null ? null : new Warehouse(warehouse);
	}
}
