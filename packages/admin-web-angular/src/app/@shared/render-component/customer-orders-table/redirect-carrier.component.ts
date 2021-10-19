import { Component, Input, OnInit } from '@angular/core';
import { Router }                   from '@angular/router';
import { ViewCell }                 from 'ng2-smart-table';
import { Observable }               from 'rxjs';
import Carrier                      from '@modules/server.common/entities/Carrier';
import { CarriersService }          from '@app/@core/data/carriers.service';

@Component({
	           styles:   [
		           `
                       .carrier-name {
                           padding-top: 5px;
                           font-weight: bold;
                       }

                       .carrier-image {
                           width: 30px;
                           height: 30px;
                       }
		           `
	           ],
	           template: `
		                     <div (click)="redirect()" class="redirectBtn">
			                     <h6 *ngIf="carrier$ | async as carrier">
				                     <img class="carrier-image"
				                          [alt]="carrier.username"
				                          [src]="carrier.logo"/>
				                     <div class="carrier-name">{{ carrier.firstName }}</div>
			                     </h6>
			                     <h6>{{ carrierStatusText | translate }}</h6>
		                     </div>
	                     `,
           })
export class RedirectCarrierComponent implements ViewCell, OnInit
{
	public value: string | number;
	
	@Input()
	public rowData: any;
	public carrier$: Observable<Carrier>;
	
	public carrierStatusText: string;
	
	constructor(
			private readonly router: Router,
			private readonly carriersService: CarriersService
	)
	{}
	
	public ngOnInit()
	{
		if(this.rowData.carrierId)
		{
			this.carrier$ = this.carriersService.getCarrierById(
					this.rowData.carrierId
			);
		}
		this.carrierStatusText =
				'STATUS_TEXT.' + this.rowData.carrierStatusText;
	}
	
	public get carrierId(): string
	{
		return this.rowData.carrierId;
	}
	
	public redirect()
	{
		if(this.rowData.carrierId)
		{
			this.router.navigate([`carriers/${this.carrierId}`]);
		}
	}
}
