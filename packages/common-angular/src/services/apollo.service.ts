import { ApolloQueryResult } from 'apollo-client';
import { FetchResult }       from 'apollo-link';
import { Apollo }            from "apollo-angular";

export type ApolloResult<T> = ApolloQueryResult<T> | FetchResult<T>

export interface IApolloServiceConfig
{
	serviceName: string;
	pollInterval?: number;
	debug?: boolean;
}

class ApolloService
{
	protected pollInterval: number;
	protected debug: boolean;
	private readonly serviceName: string;
	
	constructor(
			protected readonly apollo: Apollo,
			config?: IApolloServiceConfig
	)
	{
		this.pollInterval = config.pollInterval ?? 5000;
		this.debug = config.debug ?? false;
		this.serviceName = config.serviceName ?? ApolloService.name;
	}
	
	/**
	 * Property to get apollo result without specifying key of data
	 *
	 * @returns { R } Returns value of apollo result
	 * */
	protected get<T, R = T[keyof T]>(
			result: ApolloResult<T>,
			key?: string
	): R
	{
		try
		{
			const keys = Object.keys(result.data);
			
			if(!key)
			{
				if(keys && keys.length === 1)
				{
					key = keys[0];
				}
				else
				{
					throw new Error(`No key provided for apollo result for ${this.serviceName}`);
				}
			}
			
			if(this.debug)
			{
				if(!result)
				{
					console.warn(`Apollo result of type '${typeof result}' ` +
					             `returned null from service ${this.serviceName}`);
				}
				if(!result.data[key])
				{
					console.warn(`Apollo result of type '${typeof result.data[key]}' ` +
					             `returned null from service ${this.serviceName}`);
				}
				
				console.debug(`ApolloService get keys for service ${this.serviceName}`);
				console.debug(`${Object.keys(result.data)}: ${Object.entries(result.data)}`);
				console.debug(result.data[key]);
			}
			return result.data[key];
		} catch(e)
		{
			console.error(e);
			return null;
		}
	}
	
	/**
	 * Creates a factory from provided parameters
	 *
	 * ```ts
	 * factory<
	 *      ApolloResult<{ customer: ICustomer }>,
	 *      Customer,
	 *      ICustomer
	 *      >(result: ApolloResult<{ customer: ICustomer }>, Customer)
	 *      {...}
	 * ```
	 * @return {C | C[]}
	 * */
	protected factory<T, C, R = T[keyof T]>(
			result: ApolloResult<T>,
			Class: { new(r: R): C; },
			key?: string,
	): C | C[]
	{
		try
		{
			const _factory = (value: R): C => value === null ? null : new Class(value);
			const item = this.get<T, R>(result, key);
			
			if(item)
			{
				if(Array.isArray(item))
				{
					return item.map(i => _factory(i));
				}
				else
				{
					return _factory(item);
				}
			} else
			{
				console.warn("Unable to create data")
			}
		} catch(e)
		{
			console.error(e);
		}
		return null;
	}
}

export default ApolloService;
