import { injectable }                from 'inversify';
import Logger                        from 'bunyan';
import { inspect }                   from 'util';
import ipstack                       from 'ipstack';
import axios                         from 'axios';
import { routerName, asyncListener } from '@pyro/io';
import { ILocation }                 from '@modules/server.common/interfaces/IGeoLocation';
import GeoLocation                   from '@modules/server.common/entities/GeoLocation';
import IGeoLocationsRouter           from '@modules/server.common/routers/IGeoLocationsRouter';
import IService                      from '../IService';
import { env }                       from '../../env';
import { createLogger }              from '../../helpers/Log';

const INTERNAL_IPS = ['127.0.0.1', '::1'];

@injectable()
@routerName('geo-location')
export class GeoLocationsService implements IGeoLocationsRouter, IService
{
	protected log: Logger = createLogger({
		                                     name: 'GeoLocationsService'
	                                     });
	
	private static readonly arcgisClientID: string = env.ARCGIS_CLIENT_ID;
	private static readonly arcgisClientSecret: string = env.ARCGIS_CLIENT_SECRET;
	private static readonly ipStackApiKey = env.IP_STACK_API_KEY;
	
	constructor()
	{}
	
	getLocationByIP(clientIp: string): Promise<GeoLocation>
	{
		//TODO: Add client ip detection algorithm
		const ipStackKey = GeoLocationsService.ipStackApiKey;
		let location: ILocation;
		
		try
		{
			location = {
				type:        "Point",
				coordinates: [0, 0]
			}
			if(!ipStackKey)
			{
				this.log.warn("Cannot use getLocationByIP without ipStackApiKey");
				
				return null;
			}
			location.type = "Point";
			
			const clientIp = "5.197.252.112";
			
			if(!INTERNAL_IPS.includes(clientIp))
			{
				ipstack(clientIp, ipStackKey, (err, response) =>
				{
					location.coordinates[0] = response.latitude;
					location.coordinates[1] = response.longitude;
				});
			}
			else
			{
				this.log.info(
						`Can't use ipstack with internal ip address ${clientIp}`
				);
			}
		} catch(e)
		{
		
		}
		
		throw new Error("Method not implemented.");
	}
	
	@asyncListener()
	async getAddressByCoordinatesUsingArcGIS(
			lat: number,
			lng: number
	): Promise<any | null>
	{
		const arcGisClientID = GeoLocationsService.arcgisClientID;
		const arcGisClientSecret = GeoLocationsService.arcgisClientSecret;
		
		if(!arcGisClientID || !arcGisClientSecret)
		{
			this.log.warn(
					`Cannot use getAddressByCoordinatesUsingArcGIS without${
							arcGisClientID ? '' : ' arcgisClientID'
					}${arcGisClientSecret ? '' : ' arcgisClientSecret'}`
			);
			
			return null;
		}
		
		try
		{
			this.log.info(
					`Attempt to reverse Geocode coordinates: ${lat},${lng}`
			);
			
			const tokenRequestUrl = `https://www.arcgis.com/sharing/oauth2/token?client_id=${arcGisClientID}&client_secret=${arcGisClientSecret}&grant_type=client_credentials&f=json`;
			
			const tokenResult = await axios.get(tokenRequestUrl);
			
			if(
					!tokenResult ||
					!tokenResult.data ||
					!tokenResult.data['access_token']
			)
			{
				this.log.warn(
						`Cannot get arcgis token with client_id=${arcGisClientID}, client_secret=${arcGisClientSecret}`
				);
				return null;
			}
			else
			{
				const token = tokenResult.data['access_token'];
				
				// tslint:disable-next-line:max-line-length
				const requestBaseUrl = `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode?location=${lng}%2C${lat}&distance=200&f=json`;
				
				const requestUrl = `${requestBaseUrl}&forStorage=true&token=${token}`;
				
				const resp = await axios.get(requestUrl);
				
				if(
						resp &&
						resp.data &&
						resp.data['address'] &&
						(resp.data['address'].City ||
						 resp.data['address'].Region ||
						 resp.data['address'].Subregion)
				)
				{
					let locality: string;
					
					if(resp.data['address'].City)
					{
						locality = resp.data['address'].City;
					}
					else if(resp.data['address'].Subregion)
					{
						locality = resp.data['address'].Subregion;
					}
					else if(resp.data['address'].Region)
					{
						locality = resp.data['address'].Region;
					}
					
					const result = {
						locality,
						
						// replace removes numbers and trim spaces (they are usually wrong anyway!)
						thoroughfare: resp.data['address'].Address
						              ? resp.data['address'].Address.replace(
										/\d+|^\s+|\s+$/g,
										''
								).replace(
										/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,
										''
								)
						              : null
					};
					
					this.log.info(
							`Attempted to reverse Geocode coordinates: ${lat}, ${lng}. Got results: ` +
							`${JSON.stringify(result)}`
					);
					
					return result;
				}
				else
				{
					this.log.warn(
							`Attempted to reverse Geocode coordinates: ${lat}, ${lng}. ` +
							`Got empty response: ${resp ? inspect(resp) : ''}`
					);
					return null;
				}
			}
		} catch(err)
		{
			// Do not report it as error because geo-coding may simply not work for given coordinates
			this.log.warn(err);
			return null;
		}
	}
}
