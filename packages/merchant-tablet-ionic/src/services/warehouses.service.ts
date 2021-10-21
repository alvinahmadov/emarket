import { Injectable }                from '@angular/core';
import { Apollo }                    from 'apollo-angular';
import { FetchResult }               from 'apollo-link';
import { Observable }                from 'rxjs';
import { map, share }                from 'rxjs/operators';
import IPagingOptions                from '@modules/server.common/interfaces/IPagingOptions';
import IWarehouse                    from '@modules/server.common/interfaces/IWarehouse';
import IWarehouseProductCreateObject from '@modules/server.common/interfaces/IWarehouseProduct';
import GeoLocation                   from '@modules/server.common/entities/GeoLocation';
import Warehouse                     from '@modules/server.common/entities/Warehouse';
import WarehouseProduct              from '@modules/server.common/entities/WarehouseProduct';
import ApolloService                 from '@modules/client.common.angular2/services/apollo.service';
import { GQLMutation, GQLQuery }     from 'graphql/definitions';

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
export class WarehousesService extends ApolloService
{
	constructor(apollo: Apollo)
	{
		super(apollo,
		      {
			      serviceName: "Merchant::WarehousesService",
		      });
	}
	
	public hasExistingStores(): Observable<boolean>
	{
		return this.apollo
		           .query<{
			           hasExistingStores: boolean
		           }>({
			              query: GQLQuery.Store.HasExistingStores
		              })
		           .pipe(map((result) => this.get(result)));
	}
	
	public getCountExistingCustomers(): Observable<IExistingCustomersByStores>
	{
		return this.apollo
		           .watchQuery<{
			           getCountExistingCustomers: { total; perStore };
		           }>({ query: GQLQuery.Store.GetCountExistingCustomers })
		           .valueChanges.pipe(
						map((res) => res.data.getCountExistingCustomers)
				);
	}
	
	public getCountExistingCustomersToday(): Observable<IExistingCustomersByStores>
	{
		return this.apollo
		           .watchQuery<{
			           customersCount: IExistingCustomersByStores;
		           }>({ query: GQLQuery.Store.GetCountExistingCustomersToday })
		           .valueChanges
		           .pipe(map((result) => this.get(result)));
	}
	
	public getAllStores(): Observable<Warehouse[]>
	{
		return this.apollo
		           .query<{
			           getAllStores: Warehouse[]
		           }>({ query: GQLQuery.Store.GetAll })
		           .pipe(map((result) => this.get(result)));
	}
	
	public getStores(pagingOptions?: IPagingOptions): Observable<Warehouse[]>
	{
		return this.apollo
		           .watchQuery<{
			           warehouses: IWarehouse[]
		           }>({
			              query:        GQLQuery.Store.GetAllWithPagination,
			              variables:    { pagingOptions },
			              pollInterval: this.pollInterval,
		              })
		           .valueChanges
		           .pipe(
				           map((res) => <Warehouse[]>
						           this.factory(res, Warehouse)),
				           share()
		           );
	}
	
	public getNearbyStores(geoLocation: GeoLocation): Observable<Warehouse[]>
	{
		return this.apollo
		           .watchQuery<{
			           nearbyStores: IWarehouse[]
		           }>({
			              query:        GQLQuery.Store.GetNearby,
			              pollInterval: this.pollInterval,
			              variables:    { geoLocation },
		              })
		           .valueChanges
		           .pipe(
				           map((res) => <Warehouse[]>
						           this.factory(res, Warehouse)),
				           share()
		           );
	}
	
	public removeByIds(ids: string[]): Observable<FetchResult<void>>
	{
		return this.apollo
		           .mutate({
			                   mutation:  GQLMutation.Store.RemoveByIds,
			                   variables: { ids },
		                   });
	}
	
	public addProducts(
			warehouseId: string,
			products: IWarehouseProductCreateObject[]
	): Observable<WarehouseProduct[]>
	{
		return this.apollo
		           .mutate<{
			           products: IWarehouseProductCreateObject[];
		           }>({
			              mutation:  GQLMutation.Store.AddProducts,
			              variables: {
				              warehouseId,
				              products,
			              },
		              })
		           .pipe(
				           map((result) => <WarehouseProduct[]>
						           this.factory(result, WarehouseProduct)),
				           share()
		           );
	}
	
	public removeProductsById(
			warehouseId: string,
			productsIds: string[]
	): Observable<FetchResult<boolean>>
	{
		return this.apollo
		           .mutate({
			                   mutation:  GQLMutation.Store.RemoveProducts,
			                   variables: { warehouseId, productsIds },
		                   });
	}
	
	public getStoreById(id: string): Observable<Warehouse>
	{
		return this.apollo
		           .query({
			                  query:     GQLQuery.Store.GetById,
			                  variables: { id },
		                  })
		           .pipe(
				           map((result) => this.get(result)),
				           share()
		           );
	}
	
	public getWarehouseOrderProcess(id: string): Observable<Warehouse>
	{
		return this.apollo
		           .query({
			                  query:     GQLQuery.Store.Order.GetOrderProcess,
			                  variables: { id },
		                  })
		           .pipe(
				           map((result) => this.get(result)),
				           share()
		           );
	}
	
	public async getCountOfMerchants(): Promise<number>
	{
		return this.apollo
		           .query<{
			           count: number
		           }>({
			              query: GQLQuery.Store.GetCount,
		              })
		           .pipe(
				           map((result) => this.get(result)),
				           share()
		           )
		           .toPromise();
	}
}
