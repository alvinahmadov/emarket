import { Injectable }               from '@angular/core';
import { Apollo }                   from 'apollo-angular';
import { Observable }               from 'rxjs';
import { map, share, first }        from 'rxjs/operators';
import Device                       from '@modules/server.common/entities/Device';
import { IDeviceRawObject }         from '@modules/server.common/interfaces/IDevice';
import { GQLQueries, GQLMutations } from "@modules/server.common/utilities/graphql";

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

interface RemovedObject
{
	n: number;
	ok: number;
}

@Injectable()
export class DeviceService
{
	private readonly devices$: Observable<Device[]>;
	
	constructor(private readonly apollo: Apollo)
	{
		this.devices$ = this.apollo
		                    .watchQuery<{
			                    devices: IDeviceRawObject[]
		                    }>({
			                       query: GQLQueries.DeviceAll,
			                       pollInterval: 2000,
		                       })
		                    .valueChanges.pipe(
						map((result) => result.data.devices),
						map((devices) => devices.map((d) => this._deviceFactory(d))),
						share()
				);
	}
	
	getByFindInput(findInput: DeviceFindInput): Observable<Device[]>
	{
		return this.apollo
		           .query({
			                  query: GQLQueries.DeviceByUuid,
			                  variables: { findInput },
		                  })
		           .pipe(
				           map((res) => res.data['devices']),
				           share()
		           );
	}
	
	async getDeviceByUuid(uuid: string)
	{
		return this.getByFindInput({ uuid }).pipe(first()).toPromise();
	}
	
	getWithWebsocket()
	{
		return this.apollo
		           .watchQuery({
			                       query: GQLQueries.DeviceByWebsocket
		                       });
	}
	
	getDevices(): Observable<Device[]>
	{
		return this.devices$;
	}
	
	update(deviceId: string, updateInput: DeviceInfo): Observable<Device>
	{
		return this.apollo
		           .mutate<{
			           updateDevice: IDeviceRawObject
		           }>({
			              mutation: GQLMutations.DeviceUpdate,
			              variables: {
				              deviceId,
				              updateInput,
			              },
		              })
		           .pipe(
				           map((result: any) => result.data.updateDevice.update),
				           map((d) => this._deviceFactory(d)),
				           share()
		           );
	}
	
	removeByIds(ids: string[]): Observable<RemovedObject>
	{
		return this.apollo
		           .mutate({
			                   mutation: GQLMutations.DeviceRemoveById,
			                   variables: { ids },
		                   })
		           .pipe(
				           map((result: any) => result.data.removeDeviceByIds),
				           share()
		           );
	}
	
	create(createInput: DeviceInfo): Observable<Device>
	{
		return this.apollo
		           .mutate<{
			           createDevice: IDeviceRawObject
		           }>({
			              mutation: GQLMutations.DeviceCreate,
			              variables: {
				              createInput,
			              },
		              })
		           .pipe(
				           map((result: any) => result.data.createDevice),
				           share()
		           );
	}
	
	protected _deviceFactory(device: IDeviceRawObject)
	{
		return device == null ? null : new Device(device);
	}
}
