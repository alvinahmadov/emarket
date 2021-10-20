import { AfterViewInit, Component, OnDestroy }         from '@angular/core';
import { Router }                                      from '@angular/router';
import { TranslateService }                            from '@ngx-translate/core';
import { NgbModal }                                    from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject, forkJoin, Subscription } from 'rxjs';
import { takeUntil, first }                            from 'rxjs/operators';
import { LocalDataSource }                             from 'ng2-smart-table';
import Customer                                        from '@modules/server.common/entities/Customer';
import Order                                           from '@modules/server.common/entities/Order';
import { getDefaultCountryName }                       from '@modules/server.common/data/countries';
import { CustomersService }                            from '@app/@core/data/customers.service';
import { OrdersService }                               from '@app/@core/data/orders.service';
import { NotifyService }                               from '@app/@core/services/notify/notify.service';
import { RedirectNameComponent }                       from '@app/@shared/render-component/name-redirect/name-redirect.component';
import { RedirectChatComponent }                       from '@app/@shared/render-component/chat-redirect/chat-redirect.component';
import { CustomerImageComponent }                      from '@app/@shared/render-component/customer-table/customer-table/customer-image.component';
import { CustomerOrdersNumberComponent }               from '@app/@shared/render-component/customer-table/customer-orders-number/customer-orders-number.component';
import { CustomerEmailComponent }                      from '@app/@shared/render-component/customer-email/customer-email.component';
import { CustomerPhoneComponent }                      from '@app/@shared/render-component/customer-phone/customer-phone.component';
import { UserMutationComponent }                       from '@app/@shared/user/user-mutation';
import { BanConfirmComponent }                         from '@app/@shared/user/ban-confirm';
import { CountryRenderComponent }                      from './+invites/country-render/country-render.component';

export interface CustomerViewModel
{
	id: string;
	name: string;
	image: string;
	email: string;
	phone: string;
	country: string;
	city: string;
	address: string;
	ordersQty: number;
	isBanned: boolean;
}

const perPage = 10;

// noinspection JSUnusedLocalSymbols
@Component({
	           selector:    'ea-customers',
	           styleUrls:   ['/customers.component.scss'],
	           templateUrl: './customers.component.html',
           })
export class CustomersComponent implements AfterViewInit, OnDestroy
{
	static noInfoSign = '';
	public loading: boolean;
	public showBanLoading = false;
	public settingsSmartTable: object;
	public sourceSmartTable = new LocalDataSource();
	public selectedCustomers: CustomerViewModel[] = [];
	protected customers: Customer[] = [];
	protected orders: Order[] = [];
	private ngDestroy$ = new Subject<void>();
	private dataCount: number;
	private $customers: Subscription;
	private _showOnlyBanned: boolean;
	
	constructor(
			private readonly _router: Router,
			private readonly _ordersService: OrdersService,
			private readonly _customersService: CustomersService,
			private readonly _modalService: NgbModal,
			private readonly _translateService: TranslateService,
			private readonly _notifyService: NotifyService
	)
	{
		this._loadSettingsSmartTable();
	}
	
	public ngAfterViewInit(): void
	{
		CustomersComponent._addCustomHTMLElements();
		this._applyTranslationOnSmartTable();
		this.smartTableChange();
		this._loadDataSmartTable();
	}
	
	public ngOnDestroy(): void
	{
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}
	
	public get showOnlyBanned(): boolean
	{
		return this._showOnlyBanned;
	}
	
	public set showOnlyBanned(v: boolean)
	{
		this._showOnlyBanned = v;
		this._loadDataSmartTable();
	}
	
	public get isOnlyOneCustomerSelected(): boolean
	{
		return this.selectedCustomers.length === 1;
	}
	
	public get isCustomerBanned(): boolean
	{
		return (
				this.selectedCustomers[0] && this.selectedCustomers[0].isBanned
		);
	}
	
	public get hasSelectedCustomers(): boolean
	{
		return this.selectedCustomers.length > 0;
	}
	
	protected selectUser(ev): void
	{
		const customerId: string = ev.data.id;
		this._router.navigate(['/customers/list' + customerId]);
	}
	
	public showCreateUserModal(): void
	{
		this._modalService.open(UserMutationComponent, {
			size:        'lg',
			container:   'nb-layout',
			windowClass: 'ng-custom',
			backdrop:    'static',
		});
	}
	
	public selectCustomerTmp(ev): void
	{
		this.selectedCustomers = ev.selected;
	}
	
	public deleteSelectedRows(): void
	{
		const idsForDelete: string[] = this.selectedCustomers.map((w) => w.id);
		
		try
		{
			this.loading = true;
			this._customersService
			    .removeByIds(idsForDelete)
			    .pipe(first())
			    .toPromise();
			this.selectedCustomers = [];
			
			this.loading = false;
			const message = `Users was removed`;
			this._notifyService.success(message);
		} catch(error)
		{
			let message = `Something went wrong`;
			if(error.message === 'Validation error')
			{
				message = error.message;
			}
			this.loading = false;
			this._notifyService.error(message);
		}
	}
	
	public banSelectedRows(): void
	{
		if(this.isCustomerBanned)
		{
			this.showUnbanPopup();
		}
		else
		{
			this.showBanPopup();
		}
	}
	
	private showUnbanPopup(): void
	{
		const modal = this._modalService.open(BanConfirmComponent, {
			size:        'lg',
			container:   'nb-layout',
			windowClass: 'ng-custom',
			backdrop:    'static',
		});
		modal.componentInstance.user = this.selectedCustomers[0];
		modal.result
		     .then(async(user) =>
		           {
			           this.showBanLoading = true;
			           await this._customersService.unbanCustomer(user.id);
			           await this._loadDataSmartTable();
			           this.showBanLoading = false;
			           this._notifyService.success(`${user.name} is unbanned!`);
		           })
		     .catch((_) => {});
	}
	
	private showBanPopup(): void
	{
		const modal = this._modalService.open(BanConfirmComponent, {
			size:        'lg',
			container:   'nb-layout',
			windowClass: 'ng-custom',
			backdrop:    'static',
		});
		modal.componentInstance.user = this.selectedCustomers[0];
		modal.result
		     .then(async(user) =>
		           {
			           this.showBanLoading = true;
			           await this._customersService.banCustomer(user.id);
			           await this._loadDataSmartTable();
			           this.showBanLoading = false;
			           this._notifyService.success(`${user.name} is banned!`);
		           })
		     .catch((_) => {});
	}
	
	private _loadSettingsSmartTable(): void
	{
		const columnTitlePrefix = 'CUSTOMERS_VIEW.SMART_TABLE_COLUMNS.';
		const getTranslate = (name: string): Observable<any> =>
				this._translateService.get(columnTitlePrefix + name);
		
		forkJoin(
				this._translateService.get('Id'),
				getTranslate('IMAGE'),
				getTranslate('NAME'),
				getTranslate('EMAIL'),
				getTranslate('PHONE'),
				getTranslate('COUNTRY'),
				getTranslate('CITY'),
				getTranslate('ADDRESS'),
				getTranslate('ORDERS_QTY'),
				getTranslate('CHAT'),
		).subscribe(
				([
					 id,
					 image,
					 name,
					 email,
					 phone,
					 country,
					 city,
					 address,
					 ordersQty,
					 chat
				 ]) =>
				{
					this.settingsSmartTable = {
						actions:    false,
						selectMode: 'multi',
						columns:    {
							images:    {
								title:                   image,
								class:                   'customer-image',
								type:                    'custom',
								renderComponent:         CustomerImageComponent,
								onComponentInitFunction: (instance) =>
								                         {
									                         instance.redirectPage = 'customers/list';
								                         },
								filter:                  false,
							},
							name:      {
								title:                   name,
								type:                    'custom',
								renderComponent:         RedirectNameComponent,
								onComponentInitFunction: (instance) =>
								                         {
									                         instance.redirectPage = 'customers/list';
								                         },
							},
							email:     {
								title:           email,
								type:            'custom',
								renderComponent: CustomerEmailComponent,
							},
							phone:     {
								title:           phone,
								type:            'custom',
								renderComponent: CustomerPhoneComponent,
							},
							country:   {
								title:  country,
								editor: {
									type:      'custom',
									component: CountryRenderComponent,
								},
							},
							city:      { title: city },
							address:   { title: address },
							ordersQty: {
								title:           ordersQty,
								type:            'custom',
								renderComponent: CustomerOrdersNumberComponent,
								filter:          false,
							},
							chat:      {
								title:                   chat,
								type:                    'custom',
								width:                   '20px',
								renderComponent:         RedirectChatComponent,
								onComponentInitFunction: (instance: RedirectChatComponent) =>
								                         {
									                         instance.redirectPage = 'chats';
								                         },
								filter:                  false,
							},
						},
						pager:      {
							display: true,
							perPage,
						},
					};
				}
		);
	}
	
	private async _loadDataSmartTable(page = 1): Promise<void>
	{
		if(this.$customers)
		{
			await this.$customers.unsubscribe();
		}
		const loadData = async(customers: Customer[]) =>
		{
			const customerIds = customers.map((customer) => customer?.id);
			
			const customersOrders = await this._ordersService
			                                  .getCustomersOrdersCountInfo(customerIds);
			
			let customersVM = customers.map(
					(customer) =>
					{
						const customerOrders = customersOrders.find(
								(res) => res['id'] === customer.id
						);
						
						return {
							id:        customer.id,
							image:     customer.avatar || CustomersComponent.noInfoSign,
							name:
							           customer.firstName && customer.lastName
							           ? `${customer.firstName} ${customer.lastName}`
							           : customer.firstName
							             ? customer.firstName
							             : customer.lastName
							               ? customer.lastName
							               : customer.id,
							email:     customer.email || CustomersComponent.noInfoSign,
							phone:     customer.phone || CustomersComponent.noInfoSign,
							country:
							           getDefaultCountryName(customer.geoLocation.countryId).trim() ||
							           CustomersComponent.noInfoSign,
							city:
							           customer.geoLocation.city || CustomersComponent.noInfoSign,
							address:   ` ${
									customer.geoLocation.streetAddress ||
									CustomersComponent.noInfoSign
							}, № ${
									customer.geoLocation.house || CustomersComponent.noInfoSign
							}`,
							ordersQty: customerOrders ? customerOrders.ordersCount : 0,
							isBanned:  customer.isBanned,
						};
					});
			
			await this.loadDataCount();
			
			if(this.showOnlyBanned)
			{
				customersVM = customersVM.filter((user) => user.isBanned);
			}
			
			const customersData = new Array(this.dataCount);
			
			customersData.splice(perPage * (page - 1), perPage, ...customersVM);
			await this.sourceSmartTable.load(customersData);
		};
		
		// We call two times 'loadData_()'
		// This is need because in every change on one of them the server emit and we want to receive it
		this.$customers = this._customersService
		                      .getCustomers({
			                                    skip:  perPage * (page - 1),
			                                    limit: perPage,
		                                    })
		                      .pipe(takeUntil(this.ngDestroy$))
		                      .subscribe(async(customers: Customer[]) => await loadData(customers));
	}
	
	private _applyTranslationOnSmartTable(): void
	{
		this._translateService.onLangChange
		    .pipe(takeUntil(this.ngDestroy$))
		    .subscribe(() => this._loadSettingsSmartTable());
	}
	
	// This is just workaround to show some search
	// icon on smart table, in the future maybe we
	// must find better solution.
	private static _addCustomHTMLElements(): any
	{
		document.querySelector(
				'tr.ng2-smart-filters > th:nth-child(1)'
		).innerHTML = '<i class="fa fa-search" style="font-size: 1.3em"/>';
	}
	
	private async smartTableChange(): Promise<void>
	{
		this.sourceSmartTable
		    .onChanged()
		    .pipe(takeUntil(this.ngDestroy$))
		    .subscribe(async(event) =>
		               {
			               if(event.action === 'page')
			               {
				               const page = event.paging.page;
				               await this._loadDataSmartTable(page);
			               }
		               });
	}
	
	private async loadDataCount(): Promise<void>
	{
		this.dataCount = await this._customersService.getCountOfCustomers();
	}
}
