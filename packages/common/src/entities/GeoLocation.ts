import _                                      from 'lodash';
import { Column }                             from 'typeorm';
import { DBObject, Index, ModelName, Schema } from '../@pyro/db';
import {
	default as IGeoLocation,
	IGeoLocationCreateObject,
	ILocation
}                                             from '../interfaces/IGeoLocation';
import Country                                from '../enums/Country';
import { getCountries }                       from '../data/abbreviation-to-country';

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
	
	get countryName(): string
	{
		return this.getCountryName('ru-RU');
	}
	
	getCountryName(lang: string): string
	{
		return getCountryName(lang, this.countryId);
	}
	
	setCountryName(countryName: string) {}
	
	get isLocValid(): any
	{
		return (
				this.loc.type === 'Point' &&
				typeof _.isArray(this.loc.coordinates) &&
				this.loc.coordinates.length === 2 &&
				_.every(this.loc.coordinates, (c) => _.isFinite(c))
		);
	}
	
	get isValid(): any
	{
		const notEmptyString = (s: string) => _.isString(s) && !_.isEmpty(s);
		return _.every(
				[this.city, this.streetAddress, this.house],
				notEmptyString
		);
	}
	
	get coordinates(): { lng: number; lat: number }
	{
		// In "MongoDB" geojson standard coordinates list the longitude first and then latitude:
		return {
			lng: this.loc.coordinates[0],
			lat: this.loc.coordinates[1]
		};
	}
	
	set coordinates(coords: { lng: number; lat: number })
	{
		this.loc.coordinates = [coords.lng, coords.lat];
	}
}

export default GeoLocation;

export type CountryName = string;

export function getCountryName(lang: string, country: null): null;
export function getCountryName(lang: string, country: Country): string;
export function getCountryName(lang: string, country: Country | null): string | null;
export function getCountryName(lang: string, country: Country | null): string | null
{
	let countries = getCountries(lang);
	return countries[Country[country]] || null;
}

export function getDefaultCountryName(country: null): null;
export function getDefaultCountryName(country: Country): string;
export function getDefaultCountryName(country: Country | null): string | null;
export function getDefaultCountryName(country: Country | null): string | null
{
	let countries = getCountries('en-US');
	return countries[Country[country]] || null;
}

export function countriesIdsToNamesArrayFn(lang: string = 'ru-RU'): {
	id: Country;
	name: CountryName;
}[]
{
	return Object.keys(getCountries(lang))
	             .map((abbr) =>
	                  {
		                  return {
			                  id:   Country[abbr],
			                  name: getCountryName(lang, +Country[abbr])
		                  };
	                  })
	             .sort((c1, c2) =>
	                   {
		                   return c1.name.localeCompare(c2.name)
	                   }
	             );
}

export const countriesIdsToNamesArray = countriesIdsToNamesArrayFn();
