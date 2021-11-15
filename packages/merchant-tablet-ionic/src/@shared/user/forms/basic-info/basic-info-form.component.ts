import { Subject }                             from 'rxjs';
import { debounceTime, takeUntil }             from 'rxjs/operators';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import {
	FormBuilder,
	FormGroup,
	Validators,
	FormControl,
	AbstractControl,
}                                              from '@angular/forms';
import { AlertController }                     from '@ionic/angular';
import Customer                                from '@modules/server.common/entities/Customer';
import { ICustomerCreateObject }               from '@modules/server.common/interfaces/ICustomer';
import { CustomersService }                    from 'services/customers.service';
import { FormHelpers }                         from '../../../forms/helpers';

export type CustomerBasicInfo = Pick<ICustomerCreateObject,
		'username' | 'firstName' | 'lastName' | 'email' | 'avatar'>;

@Component({
	           selector:    'basic-info-form',
	           styleUrls:   ['./basic-info-form.component.scss'],
	           templateUrl: 'basic-info-form.component.html',
           })
export class BasicInfoFormComponent implements OnInit, OnDestroy
{
	@Input()
	public readonly form: FormGroup;
	@Input()
	public customerData: Customer = null;
	
	private _ngDestroy$ = new Subject<void>();
	private static _customers: Customer[] = [];
	private static _customer: Customer;
	
	constructor(
			private readonly _customersService: CustomersService,
			public alertController: AlertController
	)
	{}
	
	public ngOnInit()
	{
		BasicInfoFormComponent.initialize(
				this._customersService,
				this._ngDestroy$,
				this.customerData
		);
		this._loadData();
	}
	
	public ngOnDestroy()
	{
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
	
	public get username()
	{
		return this.form.get('username');
	}
	
	public get firstName()
	{
		return this.form.get('firstName');
	}
	
	public get lastName()
	{
		return this.form.get('lastName');
	}
	
	public get email()
	{
		return this.form.get('email');
	}
	
	public get avatar()
	{
		return this.form.get('avatar');
	}
	
	public deleteImg()
	{
		this.avatar.setValue('');
	}
	
	public static initialize(
			customersService: CustomersService,
			ngDestroy: Subject<void>,
			userData?: Customer
	)
	{
		customersService
				.getCustomers()
				.pipe(takeUntil(ngDestroy))
				.subscribe((customers) => this._customers = customers);
		
		userData = this._customers[0]
		this._customer = userData;
	}
	
	public static buildForm(formBuilder: FormBuilder): FormGroup
	{
		const emailSearch$ = new Subject();
		let isSearchRdy = false;
		
		return formBuilder.group({
			                         username:  ['', Validators.required],
			                         firstName: [''],
			                         lastName:  [''],
			                         email:     [
				                         '',
				                         [
					                         (control: AbstractControl) =>
							                         control?.value ? Validators.email(control) : null,
				                         ],
				                         async(ctrlEmail: FormControl) =>
				                         {
					                         if(!isSearchRdy)
					                         {
						                         //
						                         emailSearch$.pipe(debounceTime(500)).subscribe(() =>
						                                                                        {
							                                                                        //
							                                                                        const hasExistedEmail = this._customers.some(
									                                                                        (u) => u.email === ctrlEmail?.value
							                                                                        );
							                                                                        if(
									                                                                        hasExistedEmail &&
									                                                                        this._customer &&
									                                                                        this._customer.email !== ctrlEmail?.value
							                                                                        )
							                                                                        {
								                                                                        ctrlEmail.setErrors({ emailTaken: true });
							                                                                        }
						                                                                        });
						
						                         isSearchRdy = true;
					                         }
					
					                         if(
							                         isSearchRdy &&
							                         ctrlEmail?.value &&
							                         ctrlEmail?.value.length > 0
					                         )
					                         {
						                         emailSearch$.next();
					                         }
				                         },
			                         ],
			                         image:     [''],
		                         });
	}
	
	public getValue(): CustomerBasicInfo
	{
		const basicInfo = this.form.getRawValue() as {
			username: string;
			firstName: string;
			lastName: string;
			email: string;
			avatar: string;
		};
		
		return {
			username:  basicInfo.username,
			firstName: basicInfo.firstName,
			lastName:  basicInfo.lastName,
			email:     basicInfo.email,
			avatar:    basicInfo.avatar,
		};
	}
	
	public setValue<T extends CustomerBasicInfo>(basicInfo: T)
	{
		FormHelpers.deepMark(this.form, 'dirty');
		
		this.form.setValue({
			                   username:  basicInfo.username,
			                   firstName: basicInfo.firstName ? basicInfo.firstName : '',
			                   lastName:  basicInfo.lastName ? basicInfo.lastName : '',
			                   email:     basicInfo.email ? basicInfo.email : '',
			                   avatar:    basicInfo.avatar ? basicInfo.avatar : '',
		                   });
	}
	
	private _loadData()
	{
		if(this.customerData)
		{
			this.username.setValue(this.customerData?.username);
			this.firstName.setValue(this.customerData?.firstName);
			this.lastName.setValue(this.customerData?.lastName);
			this.email.setValue(this.customerData?.email);
			this.avatar.setValue(this.customerData?.avatar);
		}
	}
}
