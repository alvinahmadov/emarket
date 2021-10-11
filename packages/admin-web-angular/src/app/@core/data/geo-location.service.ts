import { Injectable } from '@angular/core';
import { Apollo }     from 'apollo-angular';
import { Observable } from 'rxjs';
import { map, share } from 'rxjs/operators';
import GeoLocation    from '@modules/server.common/entities/GeoLocation';
import ProductInfo    from '@modules/server.common/entities/ProductInfo';
import { GQLQueries } from '@modules/server.common/utilities/graphql';

@Injectable()
export class GeoLocationService
{
	private static readonly pollInteral: number = 10000;
	
	constructor(private readonly apollo: Apollo) {}
	
	public getGeoLocationProducts(geoLocation: GeoLocation): Observable<ProductInfo[]>
	{
		return this.apollo
		           .watchQuery<{
			           geoLocationProducts: ProductInfo[]
		           }>({
			              query:        GQLQueries.GeoLocationProduct,
			              variables:    {
				              geoLocation: {
					              countryId:     geoLocation.countryId,
					              city:          geoLocation.city,
					              postcode:      geoLocation.postcode,
					              streetAddress: geoLocation.streetAddress,
					              house:         geoLocation.house,
					              loc:           geoLocation.loc,
				              },
			              },
			              pollInterval: GeoLocationService.pollInteral,
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
