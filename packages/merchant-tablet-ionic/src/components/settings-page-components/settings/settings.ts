import QRCode                              from 'qrcode';
import { Component, Input, AfterViewInit } from '@angular/core';
import { BarcodeScanner }                  from '@ionic-native/barcode-scanner/ngx';
import { AlertController }                 from '@ionic/angular';
import Warehouse                           from '@modules/server.common/entities/Warehouse';
import OrderBarcodeTypes, {
	orderBarcodeTypesToString,
}                                          from '@modules/server.common/enums/OrderBarcodeTypes';
import { WarehouseRouter }                 from '@modules/client.common.angular2/routers/warehouse-router.service';

@Component({
	           selector:    'merchant-settings',
	           styleUrls:   ['./settings.scss'],
	           templateUrl: './settings.html',
           })
export class SettingsComponent implements AfterViewInit
{
	@Input()
	public currentWarehouse: Warehouse;
	
	public showPayments = false;
	
	public orderBarcodeTypes: OrderBarcodeTypes[] = [
		OrderBarcodeTypes.QR,
		OrderBarcodeTypes.CODE128,
		OrderBarcodeTypes.CODE39,
		OrderBarcodeTypes.pharmacode,
	];
	
	public selectedOrderBarcodeType: OrderBarcodeTypes;
	public barcodetDataUrl: string;
	public hasScanCode: boolean;
	
	private merchantBeforeUpdate: Warehouse;
	
	constructor(
			private warehouseRouter: WarehouseRouter,
			public alertController: AlertController,
			private barcodeScanner: BarcodeScanner
	)
	{}
	
	public ngAfterViewInit(): void
	{
		if(this.currentWarehouse)
		{
			this.merchantBeforeUpdate = new Warehouse(this.currentWarehouse);
		}
		
		this.generateQRCode();
	}
	
	public getorderBarcodeTypesToString(status: OrderBarcodeTypes)
	{
		return orderBarcodeTypesToString(status);
	}
	
	public hasChanges()
	{
		return !Array.from(arguments).includes(true) && !this.hasScanCode;
	}
	
	public async saveChanges()
	{
		try
		{
			await this.warehouseRouter.save(this.currentWarehouse);
			const alert = await this.alertController.create({
				                                                cssClass: 'success-info',
				                                                message:  'Successfully saved changes',
				                                                buttons:  ['OK'],
			                                                });
			
			await alert.present();
		} catch(error)
		{
			const alert = await this.alertController.create({
				                                                cssClass: 'error-info',
				                                                message:  error.message,
				                                                buttons:  ['OK'],
			                                                });
			
			this.currentWarehouse = this.merchantBeforeUpdate;
			await alert.present();
		}
	}
	
	public async scan()
	{
		try
		{
			const barcodeData = await this.barcodeScanner.scan();
			this.currentWarehouse.barcodeData = barcodeData.text;
			this.hasScanCode = true;
		} catch(error)
		{
			console.warn(error);
		}
	}
	
	public async barcodeDataChange(e)
	{
		if(e.value)
		{
			await this.generateQRCode();
		}
		else
		{
			this.barcodetDataUrl = null;
		}
	}
	
	private async generateQRCode()
	{
		if(this.currentWarehouse)
		{
			this.barcodetDataUrl = QRCode.toDataURL(
					this.currentWarehouse.barcodeData
			);
		}
		
		this.showPayments = true;
	}
}
