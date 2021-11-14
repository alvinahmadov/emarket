import { Observable } from 'rxjs';
import IGeoLocation   from '../interfaces/IGeoLocation';
import ProductInfo    from '../entities/ProductInfo';

export interface IPagingSortInput
{
	field: string;
	sortBy: string;
}

export interface IGeoLocationProductsPagingOptions
{
	sort?: IPagingSortInput
	limit?: number
	skip?: number
}

export interface IGeoLocationProductsOptions
{
	isDeliveryRequired?: boolean;
	isTakeaway?: boolean;
	trackingDistance?: number;
	merchantIds?: string[];
	imageOrientation?: number;
	locale?: string;
	withoutCount?: boolean;
}

export interface IGeoLocationProductsInput
{
	geoLocation: IGeoLocation;
	options?: IGeoLocationProductsOptions;
	pagingOptions?: IGeoLocationProductsPagingOptions;
	searchText?: string;
}

export interface ICountOfGeoLocationProducts
{
	geoLocation: IGeoLocation;
	options?: IGeoLocationProductsOptions;
	searchText?: string;
}

interface IGeoLocationProductsRouter
{
	get(geoLocation: IGeoLocation): Observable<ProductInfo[]>;
}

export default IGeoLocationProductsRouter;
