import { Injectable }       from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject }  from 'rxjs';
import { first }            from 'rxjs/operators';
import ILanguage            from '@modules/server.common/interfaces/ILanguage';
import IOrder               from '@modules/server.common/interfaces/IOrder';
import Carrier              from '@modules/server.common/entities/Carrier';
import Device               from '@modules/server.common/entities/Device';
import Order                from '@modules/server.common/entities/Order';
import { CarrierRouter }    from '@modules/client.common.angular2/routers/carrier-router.service';

@Injectable()
export class StorageService
{
	public selectedOrder$: BehaviorSubject<IOrder> = new BehaviorSubject(
			this.selectedOrder
	);
	
	constructor(
			private readonly carrierRouter: CarrierRouter,
			private readonly translate: TranslateService
	)
	{
	}
	
	private _selectedOrder: IOrder;
	
	public get selectedOrder(): IOrder
	{
		return this._selectedOrder;
	}
	
	public set selectedOrder(order: IOrder)
	{
		this.selectedOrder$.next(order);
		this._selectedOrder = order;
	}
	
	public get token(): string | null
	{
		return localStorage.getItem('token') || null;
	}
	
	public set token(token: string)
	{
		if(token == null)
		{
			localStorage.removeItem('token');
		}
		else
		{
			localStorage.setItem('token', token);
		}
	}
	
	public get carrierId(): string | null
	{
		return localStorage.getItem('carrier') || null;
	}
	
	public set carrierId(id: Carrier['id'] | null)
	{
		if(!id)
		{
			localStorage.removeItem('carrier');
		}
		else
		{
			localStorage.setItem('carrier', id);
		}
	}
	
	public get orderId(): string | null
	{
		return localStorage.getItem('orderId') || null;
	}
	
	public set orderId(id: Order['id'] | null)
	{
		if(id === null)
		{
			localStorage.removeItem('orderId');
		}
		else
		{
			localStorage.setItem('orderId', id);
		}
	}
	
	public get deviceId(): string | null
	{
		return localStorage.getItem('_deviceId') || null;
	}
	
	public set deviceId(id: Device['id'] | null)
	{
		if(id == null)
		{
			localStorage.removeItem('_deviceId');
		}
		else
		{
			localStorage.setItem('_deviceId', id);
		}
	}
	
	public get platform(): string | null
	{
		return localStorage.getItem('_platform') || null;
	}
	
	public set platform(type: string | null)
	{
		if(type == null)
		{
			localStorage.removeItem('_platform');
		}
		else
		{
			localStorage.setItem('_platform', type);
		}
	}
	
	public get language(): ILanguage
	{
		return (localStorage.getItem('_locale') as ILanguage) || 'ru-RU';
	}
	
	public set language(locale: ILanguage | null)
	{
		if(locale == null)
		{
			localStorage.removeItem('_locale');
		}
		else
		{
			localStorage.setItem('_locale', locale);
		}
		
		this.translate.use(locale.substr(0, 2));
	}
	
	public get maintenanceMode(): string | null
	{
		return localStorage.getItem('maintenanceMode') || null;
	}
	
	public get noInternet(): string | null
	{
		return localStorage.getItem('noInternet') || null;
	}
	
	public set noInternet(text: string | null)
	{
		if(text == null)
		{
			localStorage.removeItem('noInternet');
		}
		else
		{
			localStorage.setItem('noInternet', text);
		}
	}
	
	public get serverConnection()
	{
		return localStorage.getItem('serverConnection');
	}
	
	public set serverConnection(val: string | null)
	{
		if(val == null)
		{
			localStorage.removeItem('serverConnection');
		}
		else
		{
			localStorage.setItem('serverConnection', val);
		}
	}
	
	public get showInformationPage(): boolean
	{
		return (this.noInternet != null ||
		        this.maintenanceMode != null ||
		        Number(this.serverConnection) === 0);
	}
	
	public get returnProductFrom(): string
	{
		return localStorage.getItem('returnProductFrom');
	}
	
	public set returnProductFrom(val: string | null)
	{
		if(!val)
		{
			localStorage.removeItem('returnProductFrom');
		}
		else
		{
			localStorage.setItem('returnProductFrom', val);
		}
	}
	
	public get driveToWarehouseFrom(): string
	{
		return localStorage.getItem('driveToWarehouseFrom');
	}
	
	public set driveToWarehouseFrom(val: string | null)
	{
		if(val == null)
		{
			localStorage.removeItem('driveToWarehouseFrom');
		}
		else
		{
			localStorage.setItem('driveToWarehouseFrom', val);
		}
	}
	
	public async isLogged(): Promise<boolean>
	{
		const carrierId = this.carrierId;
		if(carrierId)
		{
			try
			{
				await this.carrierRouter
				          .get(carrierId)
				          .pipe(first())
				          .toPromise();
				return true;
			} catch(error)
			{
				return false;
			}
		}
		console.warn(`Carrier with id '${carrierId}' does not exists!"`);
		return false;
	}
	
	public clearMaintenanceMode(): void
	{
		localStorage.removeItem('maintenanceMode');
	}
	
	public clearNoInternet(): void
	{
		localStorage.removeItem('noInternet');
	}
	
	public clear(): void
	{
		localStorage.clear();
	}
}
