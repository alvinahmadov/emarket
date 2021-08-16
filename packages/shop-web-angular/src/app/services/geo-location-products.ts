import { Injectable } from '@angular/core';
import { Apollo }     from 'apollo-angular';
import IPagingOptions from '@modules/server.common/interfaces/IPagingOptions';
import { Observable } from 'rxjs';
import { map, share } from 'rxjs/operators';
import ProductInfo    from '@modules/server.common/entities/ProductInfo';
import { GQLQueries } from '@modules/server.common/utilities/graphql';

@Injectable()
export class GeoLocationProductsService
{
	constructor(private readonly apollo: Apollo) {}
	
	geoLocationProductsByPaging(
			geoLocation,
			pagingOptions: IPagingOptions,
			options?: { isDeliveryRequired?: boolean; isTakeaway?: boolean },
			searchText?: string
	): Observable<ProductInfo[]>
	{
		return this.apollo
		           .watchQuery<{ geoLocationProductsByPaging: ProductInfo[] }>(
				           {
					           query: GQLQueries.GeoLocationProductByPaging,
					           variables: { geoLocation, options, pagingOptions, searchText },
					           pollInterval: 2000,
				           })
		           .valueChanges.pipe(
						map((res) =>
								    res.data.geoLocationProductsByPaging.filter(
										    (p) => p.warehouseProduct.isProductAvailable === true
								    )
						),
						share()
				);
	}
	
	async getCountOfGeoLocationProducts(
			geoLocation,
			options?: { isDeliveryRequired?: boolean; isTakeaway?: boolean },
			searchText?: string
	)
	{
		const res = await this.apollo
		                      .query({
			                             query: GQLQueries.GeoLocationProductCount,
			                             variables: { geoLocation, options, searchText },
		                             })
		                      .toPromise();
		
		return res.data['getCountOfGeoLocationProducts'];
	}
}
