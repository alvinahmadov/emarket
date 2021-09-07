import Country from '../enums/Country';

interface IStreetLocation
{
	country: Country;
	city: string;
	streetAddress: string;
}

export default IStreetLocation;
