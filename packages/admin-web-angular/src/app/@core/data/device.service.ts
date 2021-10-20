import { Injectable }            from '@angular/core';
import { Apollo }                from 'apollo-angular';
import { Observable }            from 'rxjs';
import { first, map, share }     from 'rxjs/operators';
import Device                    from '@modules/server.common/entities/Device';
import { IDeviceRawObject }      from '@modules/server.common/interfaces/IDevice';
import ApolloService             from '@modules/client.common.angular2/services/apollo.service';
import { GQLQuery, GQLMutation } from 'graphql/definitions';

export interface DeviceInfo
{
	language: string;
	type: string;
	uuid: string;
}

export interface DeviceFindInput
{
	channelId?: string;
	language?: string;
	type?: string;
	uuid?: string;
}

interface IRemovedObjectResponse
{
	n: number;
	ok: number;
}

@Injectable()
export class DeviceService extends ApolloService
{
	private readonly devices$: Observable<Device[]>;
	
	constructor(apollo: Apollo)
	{
		super(apollo,
		      {
			      serviceName:  DeviceService.name,
			      pollInterval: 5000
		      });
		
		this.devices$ = this.apollo
		                    .watchQuery<{
			                    devices: IDeviceRawObject[]
		                    }>({
			                       query:        GQLQuery.Device.GetAll,
			                       pollInterval: this.pollInterval,
		                       })
		                    .valueChanges
		                    .pipe(
				                    map((result) => <Device[]>
						                    this.factory(result, Device)),
				                    share()
		                    );
	}
	
	public getByFindInput(findInput: DeviceFindInput): Observable<Device[]>
	{
		return this.apollo
		           .query<{
			           devices: Device[]
		           }>({
			              query:     GQLQuery.Device.GetByUuid,
			              variables: { findInput },
		              })
		           .pipe(
				           map((result) => this.get(result)),
				           share()
		           );
	}
	
	public async getDeviceByUuid(uuid: string): Promise<Device[]>
	{
		return this.getByFindInput({ uuid: uuid })
		           .pipe(first())
		           .toPromise();
	}
	
	// noinspection JSUnusedGlobalSymbols
	public getWithWebsocket(): any
	{
		return this.apollo.watchQuery({ query: GQLQuery.Device.GetByWebsocket });
	}
	
	public getDevices(): Observable<Device[]>
	{
		return this.devices$;
	}
	
	public update(deviceId: string, updateInput: DeviceInfo): Observable<Device>
	{
		return this.apollo
		           .mutate<{
			           updateDevice: IDeviceRawObject
		           }>({
			              mutation:  GQLMutation.Device.Update,
			              variables: {
				              deviceId,
				              updateInput,
			              },
		              })
		           .pipe(
				           map((result) => <Device>
						           this.factory(result, Device)),
				           share()
		           );
	}
	
	public removeByIds(ids: string[]): Observable<IRemovedObjectResponse>
	{
		return this.apollo
		           .mutate<{
			           response: IRemovedObjectResponse
		           }>({
			              mutation:  GQLMutation.Device.RemoveById,
			              variables: { ids },
		              })
		           .pipe(
				           map((result) => this.get(result)),
				           share()
		           );
	}
	
	public create(createInput: DeviceInfo): Observable<Device>
	{
		return this.apollo
		           .mutate<{
			           createDevice: IDeviceRawObject
		           }>({
			              mutation:  GQLMutation.Device.Create,
			              variables: {
				              createInput,
			              },
		              })
		           .pipe(
				           map((result) => <Device>
						           this.factory(result, Device)),
				           share()
		           );
	}
}
