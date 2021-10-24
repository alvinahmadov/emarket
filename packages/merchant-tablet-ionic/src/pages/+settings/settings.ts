import { Component }       from '@angular/core';
import { WarehouseRouter } from '@modules/client.common.angular2/routers/warehouse-router.service';
import Warehouse           from '@modules/server.common/entities/Warehouse';
import { StorageService }  from 'services/storage.service';

@Component({
	           selector:    'page-settings',
	           templateUrl: 'settings.html',
	           styleUrls:   ['./settings.scss'],
           })
export class SettingsPage
{
	public selectedSegment: any = 'account';
	
	public _currWarehouse: Warehouse;
	
	constructor(
			private warehouseRouter: WarehouseRouter,
			private storageService: StorageService
	)
	{
		this.getLocalWarehouse();
	}
	
	public get isLogged(): string
	{
		return this.storageService.warehouseId;
	}
	
	public get isBrowser(): boolean
	{
		return this.storageService.platform === 'browser';
	}
	
	public async ionViewCanEnter(): Promise<boolean>
	{
		const isLogged = await this.storageService.isLogged();
		
		return this.storageService.maintenanceMode === null && isLogged;
	}
	
	public getLocalWarehouse()
	{
		this.warehouseRouter
		    .get(localStorage.getItem('_warehouseId'))
		    .subscribe((warehouse) =>
		               {
			               this._currWarehouse = warehouse;
		               });
	}
}
