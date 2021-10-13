import {
	Component,
	ViewChild,
	OnDestroy,
	AfterViewInit
}                                      from '@angular/core';
import { NgbModal }                    from '@ng-bootstrap/ng-bootstrap';
import { TranslateService }            from '@ngx-translate/core';
import { ToasterService }              from 'angular2-toaster';
import { Subject }                     from 'rxjs';
import { first, takeUntil }            from 'rxjs/operators';
import Carrier                         from '@modules/server.common/entities/Carrier';
import { CarriersService }             from '@app/@core/data/carriers.service';
import { CarrierMutationComponent }    from '@app/@shared/carrier/carrier-mutation';
import { CarriersSmartTableComponent } from '@app/@shared/carrier/carriers-table/carriers-table.component';

const perPage = 5;

@Component({
	           selector:    'ea-carriers',
	           styleUrls:   ['./carriers.component.scss'],
	           templateUrl: './carriers.component.html',
           })
export class CarriersComponent implements OnDestroy, AfterViewInit
{
	@ViewChild('carriersTable', { static: true })
	carriersTable: CarriersSmartTableComponent;
	
	public loading: boolean;
	public perPage = perPage;
	
	private dataCount: number;
	private $carriers;
	private ngDestroy$ = new Subject<void>();
	
	constructor(
			private readonly _carriersService: CarriersService,
			private readonly _toasterService: ToasterService,
			private readonly modalService: NgbModal,
			private readonly _translateService: TranslateService
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
	
	public openWizardNewCarrier()
	{
		this.modalService.open(CarrierMutationComponent, {
			size:        'lg',
			container:   'nb-layout',
			windowClass: 'ng-custom',
			backdrop:    'static',
		});
	}
	
	public async deleteSelectedCarriers()
	{
		const idsForDelete: string[] = this.carriersTable.selectedCarriers.map(
				(c) => c.id
		);
		this.loading = true;
		
		try
		{
			await this._carriersService
			          .removeByIds(idsForDelete)
			          .pipe(first())
			          .toPromise();
			
			this.carriersTable
			    .selectedCarriers
			    .forEach(
					    (carrier) =>
							    this._toasterService.pop(
									    `success`,
									    `Carrier ${carrier['name']} DELETED`
							    )
			    );
			
			this.carriersTable.selectedCarriers = [];
			this.loading = false;
		} catch(error)
		{
			this.loading = false;
			this._toasterService.pop(`error`, `${error.message}`);
		}
	}
	
	private async _loadDataSmartTable(page = 1)
	{
		if(this.$carriers)
		{
			await this.$carriers.unsubscribe();
		}
		
		this.$carriers = this._carriersService
		                     .getCarriers({
			                                  skip:  perPage * (page - 1),
			                                  limit: perPage,
		                                  })
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
	
	private async loadDataCount()
	{
		this.dataCount = await this._carriersService.getCountOfCarriers();
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
}
