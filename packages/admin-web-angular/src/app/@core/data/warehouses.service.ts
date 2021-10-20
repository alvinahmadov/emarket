import { Injectable }                    from '@angular/core';
import { Apollo }                        from 'apollo-angular';
import { Observable }                    from 'rxjs';
import { map, share }                    from 'rxjs/operators';
import IPagingOptions                    from '@modules/server.common/interfaces/IPagingOptions';
import IWarehouse                        from '@modules/server.common/interfaces/IWarehouse';
import { IWarehouseProductCreateObject } from '@modules/server.common/interfaces/IWarehouseProduct';
import Warehouse                         from '@modules/server.common/entities/Warehouse';
import GeoLocation                       from '@modules/server.common/entities/GeoLocation';
import WarehouseProduct                  from '@modules/server.common/entities/WarehouseProduct';
import ApolloService                     from '@modules/client.common.angular2/services/apollo.service';
import { GQLMutation, GQLQuery }         from 'graphql/definitions';

interface IExistingCustomersByStore
{
	total: number;
	perStore: ICustomersByStore[]
}

interface ICustomersByStore
{
	storeId: string
	customersCount: number
}

@Injectable()
export class WarehousesService extends ApolloService
{
	constructor(apollo: Apollo)
	{
		super(apollo,
		      {
			      serviceName:  "Admin::WarehousesService",
			      pollInterval: 5000
		      });
	}
	
	public hasExistingStores(): Observable<boolean>
	{
		return this.apollo
		           .query({
			                  query: GQLQuery.Store.HasExistingStores,
		                  })
		           .pipe(map((result) => this.get(result)));
	}
	
	public getCountExistingCustomers(): Observable<IExistingCustomersByStore>
	{
		return this.apollo
		           .watchQuery({
			                       query: GQLQuery.Store.GetCountExistingCustomers,
		                       })
		           .valueChanges
		           .pipe(map((result) => this.get(result)));
	}
	
	public getCountExistingCustomersToday(): Observable<IExistingCustomersByStore>
	{
		return this.apollo
		           .watchQuery({
			                       query: GQLQuery.Store.GetCountExistingCustomersToday,
		                       })
		           .valueChanges
		           .pipe(map((result) => this.get(result)));
	}
	
	public getAllStores(): Observable<Warehouse[]>
	{
		return this.apollo
		           .query({
			                  query: GQLQuery.Store.GetAllSimple,
		                  })
		           .pipe(map((result) => this.get(result)));
	}
	
	public getStoreLivePosition(): Observable<Warehouse[]>
	{
		return this.apollo
		           .watchQuery({
			                       query:        GQLQuery.Store.GetAll,
			                       pollInterval: this.pollInterval,
		                       })
		           .valueChanges
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
				           map((result) => <Warehouse[]>
						           this.factory(result, Warehouse)),
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
		           .valueChanges.pipe(
						map((result) => <Warehouse[]>
								this.factory(result, Warehouse)),
						share()
				);
	}
	
	//TODO: WATCH
	public removeByIds(ids: string[]): Observable<boolean>
	{
		return this.apollo
		           .mutate({
			                   mutation:  GQLMutation.Store.RemoveByIds,
			                   variables: { ids },
		                   })
		           .pipe(map((result) => this.get(result)));
	}
	
	//TODO: WATCH
	public addProducts(
			warehouseId: string,
			products: IWarehouseProductCreateObject[]
	): Observable<WarehouseProduct[]>
	{
		return this.apollo
		           .mutate({
			                   mutation:  GQLMutation.Store.Product.AddProducts,
			                   variables: {
				                   warehouseId,
				                   products,
			                   },
		                   })
		           .pipe(
				           map((result) => this.get(result)),
				           share()
		           );
	}
	
	public removeProductsById(storeId: string, productsIds: string[])
	{
		return this.apollo
		           .mutate({
			                   mutation:  GQLMutation.Store.Product.RemoveProducts,
			                   variables: { warehouseId: storeId, productsIds },
		                   })
		           .pipe(
				           map((result) => this.get(result)),
				           share()
		           );
	}
	
	public getStoreById(id: string): Observable<Warehouse>
	{
		return this.apollo
		           .query({
			                  query:     GQLQuery.Store.GetByIdSimple,
			                  variables: { id },
		                  })
		           .pipe(
				           map((result) => this.get(result)),
				           share()
		           );
	}
	
	public getStoreProducts(storeId: string): Observable<WarehouseProduct[]>
	{
		return this.apollo
		           .query({
			                  query:     GQLQuery.Store.Products.GetWithPagination,
			                  variables: { storeId }
		                  })
		           .pipe(
				           map((result) => this.get(result)),
				           share()
		           )
	}
	
	public getStoreAvailableProducts(storeId: string): Observable<WarehouseProduct[]>
	{
		return this.apollo
		           .query({
			                  query:     GQLQuery.Store.Products.GetAvailableProducts,
			                  variables: { storeId }
		                  })
		           .pipe(
				           map((result) => this.get(result)),
				           share()
		           )
	}
	
	public async getCountOfMerchants(): Promise<number>
	{
		return this.apollo
		           .query({
			                  query: GQLQuery.Store.GetCount,
		                  })
		           .pipe(map((result) => this.get(result)))
		           .toPromise();
	}
}
