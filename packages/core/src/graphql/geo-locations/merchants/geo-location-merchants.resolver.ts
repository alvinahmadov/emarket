import { Query, Resolver }               from '@nestjs/graphql';
import { GeoLocationsWarehousesService } from '../../../services/geo-locations';
import IGeoLocation                      from '@modules/server.common/interfaces/IGeoLocation';
import Warehouse                         from '@modules/server.common/entities/Warehouse';
import { GeoUtils }                      from '@modules/server.common/utilities';
import GeoLocation                       from '@modules/server.common/entities/GeoLocation';

const IN_STORE_DISTANCE = 50;

type TGetGeoLocationWarehousesOptions =
		{
			activeOnly?: boolean;
			inStoreMode?: boolean;
			maxDistance?: number;
			fullProducts?: boolean;
		}

@Resolver('GeoLocationMerchants')
export class GeoLocationMerchantsResolver
{
	constructor(
			public geoLocationsWarehousesService: GeoLocationsWarehousesService
	)
	{}
	
	/**
	 * Tries to find close warehouses/merchants
	 * in range of 0 and max distance of 50 meters
	 * to the customer
	 *
	 * @param _
	 * @param {IGeoLocation} geoLocation Geolocation object
	 * for distance measures
	 *
	 * @returns {Promise<Warehouse[]>} Found merchants
	 *
	 * @memberOf {GeoLocationMerchantsResolver}
	 * */
	@Query('getCloseMerchants')
	public async getCloseMerchants(_, { geoLocation }: { geoLocation: IGeoLocation })
	{
		return this.getNearMerchants(
				_,
				{
					geoLocation: geoLocation,
					options:     {
						fullProducts: false,
						activeOnly:   true,
						inStoreMode:  true,
						maxDistance:  IN_STORE_DISTANCE
					}
				}
		);
	}
	
	
	/**
	 * Tries to find warehouses/merchants
	 * in range of 0 and max distance meters
	 * to the customer
	 *
	 * @param _
	 * @param {IGeoLocation} geoLocation Geolocation object
	 * for distance measures
	 * @param {TGetGeoLocationWarehousesOptions} options
	 *
	 * @returns {Promise<Warehouse[]>} Found merchants
	 *
	 * @memberOf {GeoLocationMerchantsResolver}
	 * */
	@Query('getNearMerchants')
	public async getNearMerchants(
			_,
			{ geoLocation, options }:
					{
						geoLocation: IGeoLocation,
						options?: TGetGeoLocationWarehousesOptions
					}
	)
	{
		let merchants = await this.geoLocationsWarehousesService
		                          .getStores(
				                          geoLocation,
				                          options?.maxDistance ?? 50,
				                          {
					                          activeOnly:   options?.activeOnly ?? true,
					                          inStoreMode:  options?.inStoreMode ?? true,
					                          fullProducts: false
				                          }
		                          );
		
		merchants = merchants.sort(
				(m1, m2) =>
						GeoUtils.getDistance(
								new GeoLocation(m1.geoLocation),
								new GeoLocation(geoLocation)
						) -
						GeoUtils.getDistance(
								new GeoLocation(m2.geoLocation),
								new GeoLocation(geoLocation)
						)
		);
		
		return merchants.map((m) => new Warehouse(m));
	}
}
