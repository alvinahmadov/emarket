import { Injectable } from '@angular/core';
import GeoLocation    from '@modules/server.common/entities/GeoLocation';
import { Apollo }     from 'apollo-angular';
import ProductInfo    from '@modules/server.common/entities/ProductInfo';
import { Observable } from 'rxjs';
import { map, share } from 'rxjs/operators';
import { GQLQueries } from '@modules/server.common/utilities/graphql';

@Injectable()
export class GeoLocationService
{
	constructor(private readonly apollo: Apollo) {}
	
	getGeoLocationProducts(
			geoLocation: GeoLocation
	): Observable<ProductInfo[]>
	{
		return this.apollo
		           .watchQuery<{
			           geoLocationProducts: ProductInfo[]
		           }>({
			              query: GQLQueries.GeoLocationProduct,
			              variables: {
				              geoLocation: {
					              countryId: geoLocation.countryId,
					              city: geoLocation.city,
					              postcode: geoLocation.postcode,
					              streetAddress: geoLocation.streetAddress,
					              house: geoLocation.house,
					              loc: geoLocation.loc,
				              },
			              },
			              pollInterval: 2000,
		              })
		           .valueChanges.pipe(
						map((res) =>
								    res.data.geoLocationProducts.filter(
										    (p) => p.warehouseProduct.isProductAvailable === true
								    )
						),
						share()
				);
	}
}
