import { Injectable } from '@angular/core';
import { Apollo }     from 'apollo-angular';
import { Observable } from 'rxjs';
import { map, share } from 'rxjs/operators';
import GeoLocation    from '@modules/server.common/entities/GeoLocation';
import ProductInfo    from '@modules/server.common/entities/ProductInfo';
import ApolloService  from '@modules/client.common.angular2/services/apollo.service';
import { GQLQuery }   from 'graphql/definitions';

@Injectable()
export class GeoLocationService extends ApolloService
{
	constructor(apollo: Apollo)
	{
		super(apollo,
		      {
			      serviceName:  GeoLocationService.name,
			      pollInterval: 5000
		      });
	}
	
	public getGeoLocationProducts(geoLocation: GeoLocation): Observable<ProductInfo[]>
	{
		return this.apollo
		           .watchQuery<{
			           geoLocationProducts: ProductInfo[]
		           }>({
			              query:        GQLQuery.GeoLocation.Product.Find,
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
			              pollInterval: this.pollInterval,
		              }).valueChanges
		           .pipe(
				           map((result) =>
						               this.get(result)
						                   ?.filter((p) => p.warehouseProduct.isProductAvailable === true)
				           ),
				           share()
		           );
	}
}
