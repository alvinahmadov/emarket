import { Component, OnInit }        from '@angular/core';
import { Router, ActivatedRoute }   from '@angular/router';
import { ToastController }          from '@ionic/angular';
import { first }                    from 'rxjs/operators';
import { IGeoLocationCreateObject } from '@modules/server.common/interfaces/IGeoLocation';
import { IWarehouseCreateObject }   from '@modules/server.common/interfaces/IWarehouse';
import { AuthService }              from 'services/auth.service';
import { CustomersService }         from 'services/customers.service';
import { StorageService }           from 'services/storage.service';
import { environment }              from 'environments/environment';
import { TranslateService }         from '@ngx-translate/core';
import {
	FormBuilder,
	Validators
}                                   from '@angular/forms';

const isProd = environment.production;

const defaultUsername = !isProd ? environment.FAKE_MERCHANT_NAME : "";
const defaultPassword = !isProd ? environment.FAKE_MERCHANT_PASSWORD : "";

export interface WarehouseRegistrationInput
{
	name: string;
	username: string;
	password: string;
	email: string;
	geolocation?: IGeoLocationCreateObject;
	acceptTerms?: boolean;
	contactEmail?: string;
	contactPhone?: string;
	logo?: string;
	ordersEmail?: string;
	ordersPhone?: string;
}

const defaultInput: WarehouseRegistrationInput = {
	name:     '',
	username: '',
	password: '',
	email:    ''
}

@Component({
	           selector:    'page-auth',
	           styleUrls:   ['./auth.scss'],
	           templateUrl: './auth.html',
           })
export class AuthPage implements OnInit
{
	warehouseName: string = '';
	email: string = '';
	loginLogo: string;
	registrationInput: WarehouseRegistrationInput = defaultInput;
	
	loginForm = this.formBuilder.group({
		                                   username: [defaultUsername, Validators.required],
		                                   password: [defaultPassword, Validators.required]
	                                   });
	
	readonly PREFIX: string = "LOGIN_VIEW.";
	readonly NOT_FOUND: string = "USER_NOT_FOUND";
	readonly LOGIN_SUC: string = "LOGIN_SUCCESS";
	
	constructor(
			private authService: AuthService,
			private customersService: CustomersService,
			private readonly toastController: ToastController,
			private readonly translateService: TranslateService,
			private storageService: StorageService,
			private router: Router,
			private activateRoute: ActivatedRoute,
			public formBuilder: FormBuilder,
	)
	{
		if(!!environment.production)
		{
			this.username = environment.FAKE_MERCHANT_NAME;
			this.password = environment.FAKE_MERCHANT_PASSWORD;
			this.email = environment.FAKE_MERCHANT_EMAIL;
			this.loginLogo = environment.LOGIN_LOGO;
		}
	}
	
	public ngOnInit()
	{
		const path = this.activateRoute.snapshot.firstChild?.url[0].path;
		if(path === 'logout')
		{
			this.reset();
		}
		else
		{
			this.storageService
			    .isLogged()
			    .then(isAuthenticated =>
			          {
				          isAuthenticated
				          ? this.router.navigate(['warehouse'])
				          : this.reset();
			          });
		}
	}
	
	public get username(): string
	{
		return this.loginForm.controls['username'].value;
	}
	
	public set username(value: string)
	{
		this.loginForm.controls['username'].setValue(value);
	}
	
	public get password(): string
	{
		return this.loginForm.controls['password'].value;
	}
	
	public set password(value: string)
	{
		this.loginForm.controls['password'].setValue(value);
	}
	
	async login()
	{
		try
		{
			const res = await this.authService
			                      .login(this.username, this.password)
			                      .pipe(first())
			                      .toPromise();
			
			if(!res)
			{
				await this.presentToast(this._translate(this.PREFIX + this.NOT_FOUND));
				this.reset();
				return;
			}
			
			const merchant = (await this.customersService
			                            .findCustomers({ username: this.username })
			                            .toPromise())[0];
			if(merchant)
			{
				this.storageService.merchantId = merchant.id;
			}
			this.storageService.warehouseId = res.warehouse.id;
			this.storageService.token = res.token;
			
			await this.router.navigate(['warehouse']);
			return;
		} catch(e)
		{
			console.error(e.message)
		}
		
		this.reset();
	}
	
	async register()
	{
		let warehouse: IWarehouseCreateObject = {
			username:           this.registrationInput.username,
			name:               this.registrationInput.name,
			isActive:           false,
			inStoreMode:        false,
			contactEmail:       this.registrationInput.contactEmail,
			contactPhone:       this.registrationInput.contactPhone,
			geoLocation:        this.registrationInput.geolocation,
			logo:               this.registrationInput.logo,
			ordersEmail:        this.registrationInput.ordersEmail,
			ordersPhone:        this.registrationInput.ordersPhone,
			forwardOrdersUsing: []
		}
		
		const password = this.registrationInput.password;
		
		try
		{
			const res = await this.authService
			                      .register({
				                                warehouse: warehouse,
				                                password:  password
			                                })
			                      .pipe(first())
			                      .toPromise();
			
			if(!res)
			{
				await this.presentToast("Пользователь не найден!");
				return;
			}
			this.storageService.warehouseId = res.id;
		} catch(e)
		{
			alert(e.message);
		}
		
		await this.presentToast(this._translate(this.PREFIX + this.LOGIN_SUC));
		
		await this.router.navigate(['warehouse']);
	}
	
	private _translate(key: string)
	{
		let translation: string;
		
		this.translateService
		    .get(key)
		    .subscribe(res => translation = res);
		
		return translation;
	}
	
	private reset()
	{
		this.storageService.merchantId = null;
		this.storageService.warehouseId = null;
		this.storageService.token = null;
	}
	
	async logout()
	{
		this.reset()
		await this.router.navigate(['auth']);
	}
	
	private async presentToast(message: string)
	{
		const toast = await this.toastController.create({
			                                                message,
			                                                duration: 2000,
		                                                });
		await toast.present();
	}
}
