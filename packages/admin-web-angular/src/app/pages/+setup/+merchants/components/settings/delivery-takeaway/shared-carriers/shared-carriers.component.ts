import {
	Component,
	ViewChild,
	Input,
	AfterViewInit,
	OnDestroy,
}                                      from '@angular/core';
import { TranslateService }            from '@ngx-translate/core';
import { Subject }                     from 'rxjs';
import { takeUntil }                   from 'rxjs/operators';
import Carrier                         from '@modules/server.common/entities/Carrier';
import { CarriersService }             from '@app/@core/data/carriers.service';
import { CarriersSmartTableComponent } from '@app/@shared/carrier/carriers-table/carriers-table.component';

const perPage = 5;

@Component({
	           selector:    'ea-merchants-setup-shared-carriers',
	           templateUrl: './shared-carriers.component.html',
           })
export class SetupMerchantSharedCarriersComponent
		implements OnDestroy, AfterViewInit
{
	@ViewChild('carriersTable', { static: true })
	public carriersTable: CarriersSmartTableComponent;
	
	@Input()
	public existedCarriersIds: string[] = [];
	
	public perPage = perPage;
	
	private dataCount: number;
	private $carriers;
	private ngDestroy$ = new Subject<void>();
	
	constructor(
			private readonly _translateService: TranslateService,
			private readonly _carriersService: CarriersService
	)
	{
		this._applyTranslationOnSmartTable();
	}
	
	public ngAfterViewInit(): void
	{
		this._loadDataSmartTable();
		this.smartTablePageChange();
	}
	
	public ngOnDestroy()
	{
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}
	
	private async _loadDataSmartTable(page = 1)
	{
		if(this.$carriers)
		{
			await this.$carriers.unsubscribe();
		}
		
		this.$carriers = this._carriersService
		                     .getCarriers(
				                     {
					                     skip:  perPage * (page - 1),
					                     limit: perPage,
				                     },
				                     {
					                     isSharedCarrier: true,
					                     _id:             {
						                     $nin: this.existedCarriersIds,
					                     },
				                     }
		                     )
		                     .pipe(takeUntil(this.ngDestroy$))
		                     .subscribe(async(data: Carrier[]) =>
		                                {
			                                const carriersVm = data.map(
					                                CarriersSmartTableComponent.getCarrierSmartTableObject
			                                );
			
			                                await this.loadDataCount();
			
			                                const carriersData = new Array(this.dataCount);
			
			                                carriersData.splice(
					                                perPage * (page - 1),
					                                perPage,
					                                ...carriersVm
			                                );
			
			                                await this.carriersTable.loadData(carriersData);
		                                });
	}
	
	private _applyTranslationOnSmartTable()
	{
		this._translateService.onLangChange
		    .pipe(takeUntil(this.ngDestroy$))
		    .subscribe(() =>
		               {
			               if(this.carriersTable)
			               {
				               this.carriersTable.loadSettingsSmartTable(this.perPage);
				               this._loadDataSmartTable();
			               }
		               });
	}
	
	private async smartTablePageChange()
	{
		if(this.carriersTable)
		{
			this.carriersTable.pageChange
			    .pipe(takeUntil(this.ngDestroy$))
			    .subscribe((page) => this._loadDataSmartTable(page));
		}
	}
	
	private async loadDataCount()
	{
		this.dataCount = await this._carriersService
		                           .getCountOfCarriers({
			                                               isSharedCarrier: true,
			                                               _id:             {
				                                               $nin: this.existedCarriersIds,
			                                               },
		                                               });
	}
}
