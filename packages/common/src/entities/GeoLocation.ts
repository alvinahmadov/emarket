import _                                      from 'lodash';
import { Column }                             from 'typeorm';
import { DBObject, Index, ModelName, Schema } from '../@pyro/db';
import {
	default as IGeoLocation,
	IGeoLocationCreateObject,
	ILocation,
    ICoordinate
}                                             from '../interfaces/IGeoLocation';
import Country                                from '../enums/Country';
import { getCountryName }                     from '../data/countries';

export const locationPreSchema = {
	type:        { type: String },
	coordinates: [Number]
};

/**
 * Stores Geo Location (Address) of some physical entity (Customer, Storage, Carrier, etc)
 *
 * @class GeoLocation
 * @extends {DBObject<IGeoLocation, IGeoLocationCreateObject>}
 * @implements {IGeoLocation}
 */
@ModelName('GeoLocation')
class GeoLocation extends DBObject<IGeoLocation, IGeoLocationCreateObject>
		implements IGeoLocation
{
	@Schema({ type: Number, required: false })
	@Column()
	countryId: Country | null;
	
	@Schema({ required: false, type: String })
	@Column()
	postcode?: string | null;
	
	@Schema({ required: false, type: String })
	@Column()
	notes?: string | null;
	
	@Schema({ type: String, required: false })
	@Column()
	apartment?: string | null;
	
	@Schema({ type: String, required: false })
	@Column()
	city: string | null;
	
	@Schema({ type: String, required: false })
	@Column()
	streetAddress: string | null;
	
	@Schema({ type: String, required: false })
	@Column()
	house: string | null;
	
	@Index('2dsphere')
	@Schema(locationPreSchema)
	loc: ILocation;
	
	public get countryName(): string
	{
		return this.getCountryName('ru-RU');
	}
	
	public getCountryName(lang: string): string
	{
		return getCountryName(lang, this.countryId);
	}
	
	public get isLocValid(): any
	{
		return (
				this.loc.type === 'Point' &&
				typeof _.isArray(this.loc.coordinates) &&
				this.loc.coordinates.length === 2 &&
				_.every(this.loc.coordinates, (c) => _.isFinite(c))
		);
	}
	
	public get isValid(): any
	{
		const notEmptyString = (s: string) => _.isString(s) && !_.isEmpty(s);
		return _.every(
				[this.city, this.streetAddress, this.house],
				notEmptyString
		);
	}
	
	public get coordinates(): ICoordinate
	{
		// In "MongoDB" geojson standard coordinates list the longitude first and then latitude:
		return {
			lng: this.loc.coordinates[0],
			lat: this.loc.coordinates[1]
		};
	}
	
	public set coordinates(coords: ICoordinate)
	{
		this.loc.coordinates = [coords.lng, coords.lat];
	}
}

export default GeoLocation;
