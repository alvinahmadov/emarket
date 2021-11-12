import { Query, Resolver }             from '@nestjs/graphql';
import { first }                       from 'rxjs/operators';
import {
	IGeoLocationProductsInput,
	ICountOfGeoLocationProducts
}                                      from '@modules/server.common/routers/IGeoLocationProductsRouter';
import GeoLocation                     from '@modules/server.common/entities/GeoLocation';
import ProductInfo                     from '@modules/server.common/entities/ProductInfo';
import { GeoLocationsProductsService } from '../../services/geo-locations';

@Resolver('GeoLocation')
export class GeoLocationResolver
{
	constructor(
			private readonly _geoLocationsProductsService: GeoLocationsProductsService
	)
	{}
	
	@Query('geoLocationProducts')
	public async getGeoLocationProducts(
			_,
			{ geoLocation }: { geoLocation: GeoLocation }
	): Promise<ProductInfo[]>
	{
		return this._geoLocationsProductsService
		           .get(geoLocation)
		           .pipe(first())
		           .toPromise();
	}
	
	@Query()
	public async geoLocationProductsByPaging(
			_,
			{
				geoLocation,
				options,
				pagingOptions = {},
				searchText
			}: IGeoLocationProductsInput
	): Promise<ProductInfo[]>
	{
		return this._geoLocationsProductsService.geoLocationProductsByPaging(
				geoLocation,
				pagingOptions,
				options,
				searchText
		);
	}
	
	@Query()
	public async getCountOfGeoLocationProducts(
			_,
			{
				geoLocation,
				options,
				searchText
			}: ICountOfGeoLocationProducts
	): Promise<number>
	{
		return this._geoLocationsProductsService.getCountOfGeoLocationProducts(
				geoLocation,
				options,
				searchText
		);
	}
}
