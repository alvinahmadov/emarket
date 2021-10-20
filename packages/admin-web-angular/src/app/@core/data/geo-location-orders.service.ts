import { Injectable }     from '@angular/core';
import { Apollo }         from 'apollo-angular';
import { Observable }     from 'rxjs';
import { map, share }     from 'rxjs/operators';
import IGeoLocation       from '@modules/server.common/interfaces/IGeoLocation';
import IPaginationOptions from '@modules/server.common/interfaces/IPaginationOptions';
import Order              from '@modules/server.common/entities/Order';
import ApolloService      from '@modules/client.common.angular2/services/apollo.service';
import { GQLQuery }       from 'graphql/definitions';

@Injectable()
export class GeoLocationOrdersService extends ApolloService
{
	constructor(apollo: Apollo)
	{
		super(apollo,
		      {
			      serviceName: "Admin::GeoLocationOrdersService"
		      });
	}
	
	public getOrdersForWork(
			geoLocation: IGeoLocation,
			skippedOrderIds: string[]   = [],
			options: IPaginationOptions = {
				sort: 'asc',
			},
			searchObj?: { byRegex: Array<{ key: string; value: string }> }
	): Observable<Order[]>
	{
		return this.apollo
		           .watchQuery<{
			           getOrdersForWork: Order[]
		           }>({
			              query:        GQLQuery.GeoLocation.Order.ForWork,
			              variables:    { geoLocation, skippedOrderIds, options, searchObj },
			              pollInterval: this.pollInterval,
		              })
		           .valueChanges
		           .pipe(
				           map((result) => this.get(result)),
				           share()
		           );
	}
	
	async getCountOfOrdersForWork(
			geoLocation: IGeoLocation,
			skippedOrderIds: string[] = [],
			searchObj?: { byRegex: Array<{ key: string; value: string }> }
	): Promise<number>
	{
		return await this.apollo
		                 .query<{
			                 count: number
		                 }>({
			                    query:     GQLQuery.GeoLocation.Order.ForWorkCount,
			                    variables: { geoLocation, skippedOrderIds, searchObj },
		                    })
		                 .pipe(map((result) => this.get(result)))
		                 .toPromise();
	}
}
