import { Injectable } from '@angular/core';
import { Apollo }     from 'apollo-angular';
import { map }        from 'rxjs/operators';
import Store          from '@modules/server.common/entities/Warehouse';
import ApolloService  from '@modules/client.common.angular2/services/apollo.service';
import { GQLQuery }   from 'graphql/definitions';

interface ISortOptions
{
	field: string;
	sortBy: string;
}

export interface IPagingOptionsInput
{
	sort: ISortOptions;
	limit: number;
	skip: number;
}

@Injectable()
export class WarehousesService extends ApolloService
{
	constructor(apollo: Apollo)
	{
		super(apollo, {
			serviceName: 'Shop::WarehousesService'
		});
	}
	
	public async getStore(id: string): Promise<Store>
	{
		return this.apollo
		           .query<{
			           store: Store
		           }>({
			              query:     GQLQuery.Store.GetById,
			              variables: { id },
		              })
		           .pipe(map((result) => this.get(result)))
		           .toPromise();
	}
	
	public async getWarehouses(): Promise<Store[]>
	{
		return this.apollo
		           .query<{
			           store: Store[]
		           }>({ query: GQLQuery.Store.GetAll })
		           .pipe(map((result) => this.get(result)))
		           .toPromise();
	}
	
	public async getWarehousesByPaging(pagingOptions?: IPagingOptionsInput): Promise<Store[]>
	{
		return this.apollo
		           .query<{
			           stores: Store[]
		           }>({
			              query:     GQLQuery.Store.GetAllWithPagination,
			              variables: { pagingOptions },
		              })
		           .pipe(map((result) => this.get(result)))
		           .toPromise();
	}
	
	public async getWarehousesCount(): Promise<number>
	{
		return this.apollo
		           .query<{
			           count: number
		           }>({
			              query: GQLQuery.Store.GetCount
		              })
		           .pipe(map((result) => this.get(result)))
		           .toPromise();
	}
}
