import { Injectable } from '@angular/core';
import { Apollo }     from 'apollo-angular';
import { Observable } from 'rxjs';
import { map, share } from 'rxjs/operators';
import Warehouse      from '@modules/server.common/entities/Warehouse';
import ApolloService  from '@modules/client.common.angular2/services/apollo.service';
import { GQLQuery }   from 'graphql/definitions';

export interface GeoLocationWarehousesOptions
{
	fullProducts?: boolean;
	activeOnly?: boolean
	maxDistance?: number
	inStoreMode?: boolean
}

@Injectable()
export class GeoLocationWarehousesService extends ApolloService
{
	constructor(apollo: Apollo)
	{
		super(apollo, {
			serviceName:  GeoLocationWarehousesService.name,
			pollInterval: 4000
		});
	}
	
	public geoLocationWarehouses(
			geoLocation,
			options?: GeoLocationWarehousesOptions,
	): Observable<Warehouse[]>
	{
		return this.apollo
		           .watchQuery<{
			           geoLocationWarehouses: Warehouse[]
		           }>(
				           {
					           query:        GQLQuery.GeoLocation.Store.Get,
					           variables:    { geoLocation, options },
					           pollInterval: this.pollInterval,
				           })
		           .valueChanges
		           .pipe(
				           map((result) => this.get(result)),
				           share()
		           );
	}
}
