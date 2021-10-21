import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TranslateService }                       from '@ngx-translate/core';
import CarrierStatus                              from '@modules/server.common/enums/CarrierStatus';
import Carrier                                    from '@modules/server.common/entities/Carrier';
import { CarrierRouter }                          from '@modules/client.common.angular2/routers/carrier-router.service';
import { environment }                            from 'environments/environment';

@Component({
	           selector: 'ea-carrier-info',
	           styleUrls: ['carrier-info.component.scss'],
	           templateUrl: 'carrier-info.component.html',
           })
export class CarrierInfoComponent
{
	@Input()
	public carrier: Carrier;
	
	@Output()
	public getChangeCarrier = new EventEmitter<Carrier>();
	
	public showCode: boolean = false;
	public loading: boolean;
	public locale: string;
	
	constructor(
			private carrierRouter: CarrierRouter,
			private _translateService: TranslateService
	)
	{
		if(this._translateService.getLangs().length === 0)
		{
			this._translateService.addLangs(environment.AVAILABLE_LOCALES.split('|'));
		}
		
		if (!this._translateService.currentLang)
		{
			this._translateService.use(environment.DEFAULT_LANGUAGE);
		}
		
		this.locale = this._translateService.currentLang;
	}
	
	public async toogleStatus()
	{
		this.loading = true;
		const isOnline = this.carrier.status === CarrierStatus.Online;
		const carrier = await this.carrierRouter.updateStatus(
				this.carrier.id,
				isOnline ? CarrierStatus.Offline : CarrierStatus.Online
		);
		this.getChangeCarrier.emit(carrier);
		this.loading = false;
	}
}
