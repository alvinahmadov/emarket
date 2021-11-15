import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { TranslateService }                               from '@ngx-translate/core';
import { LocalDataSource }                                from 'ng2-smart-table';
import { Subject, forkJoin, Observable }                  from 'rxjs';
import { takeUntil }                                      from 'rxjs/operators';
import Customer                                           from '@modules/server.common/entities/Customer';
import { CustomersService }                               from 'services/customers.service';
import { AddressComponent }                               from './address.component';

@Component({
	           selector:  'select-add-customer',
	           styleUrls: ['./select-add-customer.component.scss'],
	           template:  `
		                      <span class="select-add-customer-component">
			           <div class="customers-table" *ngIf="isSelectedFromExisting">
				           <ng2-smart-table
						           class="smart-table"
						           [settings]="settingsSmartTable"
						           [source]="sourceSmartTable"
						           (userRowSelect)="selectFromExisting($event)"
				           >
				           </ng2-smart-table>
			           </div>

			           <div *ngIf="!isSelectedFromExisting">
				           <user-mutation
						           [visible]="visible"
						           (updateVisible)="changeState($event)"
						           (customerIdEmitter)="broadcastCustomerId($event)"
				           ></user-mutation>
			           </div>
		           </span>
	                      `,
           })
export class SelectAddCustomerComponent implements OnInit
{
	private ngDestroy$ = new Subject<void>();
	
	// TODO: Watch for changeState => updateVisible in template
	public visible: boolean;
	
	@Input()
	public customerOptionSelected: number;
	
	public settingsSmartTable: object;
	public sourceSmartTable = new LocalDataSource();
	
	@Output()
	public customerIdEmitter = new EventEmitter<string>();
	
	private _noInfoSign = '';
	private _ngDestroy$ = new Subject<void>();
	
	constructor(
			private readonly _customersService: CustomersService,
			private readonly _translateService: TranslateService
	)
	{}
	
	public get isSelectedFromExisting(): boolean
	{
		return this.customerOptionSelected === 0;
	}
	
	public ngOnInit()
	{
		this._setupSettingsSmartTable();
		this._loadDataSmartTable();
	}
	
	public selectFromExisting(ev)
	{
		this.broadcastCustomerId(ev.data.id);
	}
	
	public changeState(ev): void
	{
		this.visible = ev;
	}
	
	public broadcastCustomerId(customerId: string)
	{
		this.customerIdEmitter.emit(customerId);
	}
	
	private _setupSettingsSmartTable()
	{
		const columnTitlePrefix = 'WAREHOUSE_VIEW.NEW_ORDER_VIEW.';
		const getTranslate = (name: string): Observable<string | any> =>
				this._translateService.get(columnTitlePrefix + name);
		
		forkJoin(
				this._translateService.get('Id'),
				getTranslate('USERNAME'),
				getTranslate('FULL_NAME'),
				getTranslate('EMAIL'),
				getTranslate('PHONE'),
				getTranslate('ADDRESS')
		)
				.pipe(takeUntil(this.ngDestroy$))
				.subscribe(([username, fullName, email, phone, address]) =>
				           {
					           this.settingsSmartTable = {
						           actions: false,
						           filters: false,
						           pager:   {
							           perPage: 3,
						           },
						           columns: {
							           username: { title: username },
							           name:     { title: fullName },
							           email:    { title: email },
							           phone:    { title: phone },
							           address:  {
								           title:           address,
								           type:            'custom',
								           renderComponent: AddressComponent,
							           },
						           },
					           };
				           });
	}
	
	private _loadDataSmartTable()
	{
		this._customersService
		    .getCustomers()
		    .pipe(takeUntil(this._ngDestroy$))
		    .subscribe((customers: Customer[]) =>
		               {
			               const formattedData = this._formatDataSmartTable(customers);
			               this.sourceSmartTable.load(formattedData);
		               });
	}
	
	private _formatDataSmartTable(customers: Customer[])
	{
		return customers.map((customer: Customer) =>
		                     {
			                     return {
				                     id:       customer.id,
				                     username: customer.username,
				                     fullname: `${customer.fullName || this._noInfoSign}`,
				                     email:    customer.email || this._noInfoSign,
				                     phone:    customer.phone || this._noInfoSign,
				                     address:  customer.fullAddress || this._noInfoSign,
				                     customer: customer,
			                     };
		                     });
	}
}
