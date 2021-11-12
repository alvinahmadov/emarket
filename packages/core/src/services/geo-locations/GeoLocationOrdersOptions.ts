import IGeoLocation from '@modules/server.common/interfaces/IGeoLocation';

export interface IGeoLocationOrdersOptions
{
	sort?: string;
	limit?: number;
	skip?: number;
}

interface IGeoLocationWorkOrderRegexRecord
{
	key: string;
	value: string;
}

export interface IGeoLocationWorkOrderSearchInput
{
	isCancelled?: boolean;
	byRegex: Array<IGeoLocationWorkOrderRegexRecord>;
}

export interface IGeoLocationWorkOrderInput
{
	geoLocation: IGeoLocation;
	skippedOrderIds: string[];
	options: IGeoLocationOrdersOptions;
	searchObj?: Partial<IGeoLocationWorkOrderSearchInput>;
}

export interface IGeoLocationWorkOrdersInput extends IGeoLocationWorkOrderInput
{
	searchObj: IGeoLocationWorkOrderSearchInput;
}
