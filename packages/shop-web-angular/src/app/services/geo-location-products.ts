import { Injectable }                  from '@angular/core';
import { Apollo }                      from 'apollo-angular';
import { Observable }                  from 'rxjs';
import { map, share }                  from 'rxjs/operators';
import IPagingOptions                  from '@modules/server.common/interfaces/IPagingOptions';
import { IGeoLocationProductsOptions } from '@modules/server.common/routers/IGeoLocationProductsRouter';
import ProductInfo                     from '@modules/server.common/entities/ProductInfo';
import ApolloService                   from '@modules/client.common.angular2/services/apollo.service';
import { GQLQuery }                    from 'graphql/definitions';

@Injectable()
export class GeoLocationProductsService extends ApolloService
{
	constructor(apollo: Apollo)
	{
		super(apollo, {
			serviceName:  'Shop::GeoLocationProductsService',
			pollInterval: 2000,
		});
	}
	
	public geoLocationProductsByPaging(
			geoLocation,
			pagingOptions: IPagingOptions,
			options?: IGeoLocationProductsOptions,
			searchText?: string
	): Observable<ProductInfo[]>
	{
		return this.apollo
		           .watchQuery<{
			           geoLocationProductsByPaging: ProductInfo[]
		           }>(
				           {
					           query:        GQLQuery.GeoLocation.Product.GetByPaging,
					           variables:    { geoLocation, options, pagingOptions, searchText },
					           pollInterval: this.pollInterval,
				           })
		           .valueChanges
		           .pipe(
				           map((res) => this.get(res)
				           ),
				           share()
		           );
	}
	
	public async getCountOfGeoLocationProducts(
			geoLocation,
			options?: IGeoLocationProductsOptions,
			searchText?: string
	)
	{
		return this.apollo
		           .query({
			                  query:     GQLQuery.GeoLocation.Product.Count,
			                  variables: { geoLocation, options, searchText },
		                  })
		           .pipe(map((result) => this.get(result)))
		           .toPromise();
	}
}
