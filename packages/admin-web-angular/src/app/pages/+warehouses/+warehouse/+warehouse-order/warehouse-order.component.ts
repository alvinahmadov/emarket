import {
	Component,
	ViewChild,
	OnInit,
	OnDestroy,
	EventEmitter,
}                                            from '@angular/core';
import { ActivatedRoute }                    from '@angular/router';
import { TranslateService }                  from '@ngx-translate/core';
import { NgbActiveModal }                    from '@ng-bootstrap/ng-bootstrap';
import { WizardComponent }                   from '@ever-co/angular2-wizard';
import { ToasterService }                    from 'angular2-toaster';
import { LocalDataSource }                   from 'ng2-smart-table';
import { Subject }                           from 'rxjs';
import { takeUntil, finalize }               from 'rxjs/operators';
import Customer                              from '@modules/server.common/entities/Customer';
import { IOrderCreateInputProduct }          from '@modules/server.common/routers/IWarehouseOrdersRouter';
import { CustomersService }                  from '@app/@core/data/customers.service';
import { WarehouseOrdersService }            from '@app/@core/data/warehouseOrders.service';
import { WarehouseOrderModalComponent }      from '@app/@shared/warehouse/+warehouse-order-modal/warehouse-order-modal.component';
import { WarehouseOrderCreateUserComponent } from './create-user/warehouse-order-create-user.component';

const perPage = 5;

@Component({
	           styleUrls:   ['./warehouse-order.component.scss'],
	           templateUrl: './warehouse-order.component.html',
           })
export class WarehouseOrderComponent implements OnInit, OnDestroy
{
	public loading: boolean;
	
	public warehouseId: string;
	public titleSelectAdd: string = this._translate(
			this.TRANSLATE_PREFIXES.STEP2.TITLE.SELECT_ADD
	);
	public isSelectedFromExisting: boolean;
	public showNextButton: boolean = false;
	public isOrderAllowed: boolean = false;
	
	public settingsSmartTable: object;
	public sourceSmartTable = new LocalDataSource();
	
	public createUserEmitter = new EventEmitter<void>();
	public orderFinishedEmitter = new EventEmitter<void>();
	
	@ViewChild('wizardFormStepTwo')
	public wizardFormStepTwo: WizardComponent;
	
	@ViewChild('wizardForm', { static: true })
	private _wizardForm: WizardComponent;
	
	@ViewChild('warehouseOrderCreateUser')
	private _warehouseOrderCreateUser: WarehouseOrderCreateUserComponent;
	
	@ViewChild('warehouseOrderModal')
	private _warehouseOrderModal: WarehouseOrderModalComponent;
	
	private _userIdToOrder: string;
	private customerSelected: any;
	private _dataIsLoaded: boolean = false;
	
	private _noInfoSign = '';
	private _ngDestroy$ = new Subject<void>();
	
	private dataCount: number;
	private $users;
	
	constructor(
			private readonly activeModal: NgbActiveModal,
			private readonly _activatedRoute: ActivatedRoute,
			private readonly _toasterService: ToasterService,
			private readonly _translateService: TranslateService,
			private readonly _usersService: CustomersService,
			private readonly _warehouseOrdersService: WarehouseOrdersService
	)
	{}
	
	public get TRANSLATE_PREFIXES(): any
	{
		const wizardFormPrefix =
				      'WAREHOUSE_VIEW.CREATE_ORDER_MODAL.WIZARD_FORM';
		const step1Prefix = 'STEP1';
		const step2Prefix = 'STEP2';
		const step3Prefix = 'STEP3';
		
		return {
			BUTTON_NEXT: `${wizardFormPrefix}.BUTTON_NEXT`,
			BUTTON_PREV: `${wizardFormPrefix}.BUTTON_PREV`,
			BUTTON_DONE: `${wizardFormPrefix}.BUTTON_DONE`,
			STEP1:       {
				TITLE:                `${wizardFormPrefix}.${step1Prefix}.TITLE`,
				SELECT_FROM_EXISTING: `${wizardFormPrefix}.${step1Prefix}.SELECT_FROM_EXISTING`,
				ADD_NEW_CUSTOMER:     `${wizardFormPrefix}.${step1Prefix}.ADD_NEW_CUSTOMER`,
			},
			STEP2:       {
				TITLE:       {
					SELECT_ADD:      `${wizardFormPrefix}.${step2Prefix}.TITLE.SELECT_ADD`,
					SELECT_CUSTOMER: `${wizardFormPrefix}.${step2Prefix}.TITLE.SELECT_CUSTOMER`,
					ADD_NEW:         `${wizardFormPrefix}.${step2Prefix}.TITLE.ADD_NEW`,
				},
				SMART_TABLE: {
					TITLES: {
						FULL_NAME: `${wizardFormPrefix}.${step2Prefix}.SMART_TABLE.TITLES.FULL_NAME`,
						EMAIL:     `${wizardFormPrefix}.${step2Prefix}.SMART_TABLE.TITLES.EMAIL`,
						PHONE:     `${wizardFormPrefix}.${step2Prefix}.SMART_TABLE.TITLES.PHONE`,
						ADDRESS:   `${wizardFormPrefix}.${step2Prefix}.SMART_TABLE.TITLES.ADDRESS`,
					},
				},
			},
			STEP3:       {
				TITLE: `${wizardFormPrefix}.${step3Prefix}.TITLE`,
			},
		};
	}
	
	public get isCreateOrderWizardAllowed(): boolean
	{
		return (
				this.isSelectedFromExisting ||
				(this._warehouseOrderCreateUser !== undefined &&
				 this._warehouseOrderCreateUser.form.valid)
		);
	}
	
	public get buttonDone(): string
	{
		return this._translate(this.TRANSLATE_PREFIXES.BUTTON_DONE);
	}
	
	public get buttonNext(): string
	{
		return this._translate(this.TRANSLATE_PREFIXES.BUTTON_NEXT);
	}
	
	public get buttonPrevious(): string
	{
		return this._translate(this.TRANSLATE_PREFIXES.BUTTON_PREV);
	}
	
	private get _isAllowedToCreateCustomer(): boolean
	{
		return !this.isSelectedFromExisting;
	}
	
	public ngOnInit()
	{
		this._listenStepWizard();
		this._getWarehouseIdFromRoute();
		this.smartTableChange();
	}
	
	public ngOnDestroy()
	{
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
	
	public onIsOrderAllowed(orderAllowed: boolean)
	{
		this.isOrderAllowed = orderAllowed;
	}
	
	public onMakeOrder(orderProducts: IOrderCreateInputProduct[])
	{
		this.loading = true;
		this._warehouseOrdersService
		    .createOrder({
			                 customerId:  this._userIdToOrder,
			                 warehouseId: this.warehouseId,
			                 products:    orderProducts,
		                 })
		    .pipe(takeUntil(this._ngDestroy$))
		    .pipe(finalize(() => this.orderFinishedEmitter.emit()))
		    .subscribe(
				    () =>
				    {
					    this.loading = false;
					    this._toasterService.pop(
							    `success`,
							    `User ${this.customerSelected.name} finish the order`
					    );
				    },
				    () =>
				    {
					    this.loading = false;
					    this._toasterService.pop(
							    'error',
							    'Something is wrong, unable to place order'
					    );
				    }
		    );
	}
	
	public onNewUser(userData)
	{
		userData.name =
				(userData.firstName ? userData.firstName : '') +
				' ' +
				(userData.lastName ? userData.lastName : '');
		this.customerSelected = userData;
		
		this._userIdToOrder = userData.id;
	}
	
	public onNextStep()
	{
		this._wizardForm.next();
	}
	
	public selectExistingCustomer()
	{
		this.titleSelectAdd = this._translate(
				this.TRANSLATE_PREFIXES.STEP2.TITLE.SELECT_CUSTOMER
		);
		
		this.isSelectedFromExisting = true;
		this.showNextButton = false;
		
		this._loadAndSetupData();
		this.onNextStep();
	}
	
	public addNewCustomer()
	{
		this.titleSelectAdd = this._translate(
				this.TRANSLATE_PREFIXES.STEP2.TITLE.ADD_NEW
		);
		
		this.isSelectedFromExisting = false;
		this.showNextButton = true;
		
		this.onNextStep();
	}
	
	public selectFromExisting(ev)
	{
		this.customerSelected = ev.data;
		this._userIdToOrder = ev.data.id;
		this._wizardForm.next();
	}
	
	public completeOrder()
	{
		this._warehouseOrderModal.makeOrder();
	}
	
	public cancel()
	{
		this.activeModal.dismiss('canceled');
	}
	
	private _translate(key: string): string
	{
		let translationResult = '';
		
		this._translateService.get(key).subscribe((res) =>
		                                          {
			                                          translationResult = res;
		                                          });
		
		return translationResult;
	}
	
	private _loadAndSetupData()
	{
		if(!this._dataIsLoaded)
		{
			this._setupSmartTableSettings();
			this._loadDataSmartTable();
			this._dataIsLoaded = true;
		}
	}
	
	private _listenStepWizard()
	{
		this._wizardForm.onStepChanged
		    .pipe(takeUntil(this._ngDestroy$))
		    .subscribe((wizardStep) =>
		               {
			               const currentStepIndex = this._wizardForm.activeStepIndex;
			
			               if(currentStepIndex === 0)
			               {
				               this.titleSelectAdd = this._translate(
						               this.TRANSLATE_PREFIXES.STEP2.TITLE.SELECT_ADD
				               );
			               }
			               if(currentStepIndex === 2 && this._isAllowedToCreateCustomer)
			               {
				               this.createUserEmitter.emit();
			               }
		               });
	}
	
	private _setupSmartTableSettings()
	{
		const fullName = this._translate(
				this.TRANSLATE_PREFIXES.STEP2.SMART_TABLE.TITLES.FULL_NAME
		);
		const email = this._translate(
				this.TRANSLATE_PREFIXES.STEP2.SMART_TABLE.TITLES.EMAIL
		);
		const phone = this._translate(
				this.TRANSLATE_PREFIXES.STEP2.SMART_TABLE.TITLES.PHONE
		);
		const address = this._translate(
				this.TRANSLATE_PREFIXES.STEP2.SMART_TABLE.TITLES.ADDRESS
		);
		
		this.settingsSmartTable = {
			actions: false,
			columns: {
				name:    { title: fullName },
				email:   { title: email },
				phone:   { title: phone },
				address: { title: address },
			},
			pager:   {
				display: true,
				perPage,
			},
		};
	}
	
	private async _loadDataSmartTable(page = 1)
	{
		if(this.$users)
		{
			await this.$users.unsubscribe();
		}
		this.$users = this._usersService
		                  .getCustomers({
			                                skip:  perPage * (page - 1),
			                                limit: perPage,
		                                })
		                  .pipe(takeUntil(this._ngDestroy$))
		                  .subscribe(async(users: Customer[]) =>
		                             {
			                             await this.loadDataCount();
			                             const formattedData = this._setupDataForSmartTable(users);
			                             const usersData = new Array(this.dataCount);
			
			                             usersData.splice(
					                             perPage * (page - 1),
					                             perPage,
					                             ...formattedData
			                             );
			
			                             await this.sourceSmartTable.load(usersData);
		                             });
	}
	
	private _setupDataForSmartTable(users: Customer[])
	{
		return users.map((user: Customer) =>
		                 {
			                 return {
				                 id:      user.id,
				                 name:    `
					${user.firstName || this._noInfoSign} ${user.lastName || this._noInfoSign}
				`,
				                 email:   user.email || this._noInfoSign,
				                 phone:   user.phone || this._noInfoSign,
				                 address: user.fullAddress || this._noInfoSign,
			                 };
		                 });
	}
	
	private _getWarehouseIdFromRoute()
	{
		this._activatedRoute.children[0].children[0].children[0].children[0].params
		                                                                    .pipe(takeUntil(this._ngDestroy$))
		                                                                    .subscribe((params) =>
		                                                                               {
			                                                                               this.warehouseId = params.id;
		                                                                               });
	}
	
	private async smartTableChange()
	{
		this.sourceSmartTable
		    .onChanged()
		    .pipe(takeUntil(this._ngDestroy$))
		    .subscribe(async(event) =>
		               {
			               if(event.action === 'page')
			               {
				               const page = event.paging.page;
				               this._loadDataSmartTable(page);
			               }
		               });
	}
	
	private async loadDataCount()
	{
		this.dataCount = await this._usersService.getCountOfCustomers();
	}
}
