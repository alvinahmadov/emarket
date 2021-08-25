import { Component }                from '@angular/core';
import { AuthService }              from '../../services/auth.service';
import { Store }                    from '../../services/store.service';
import { environment }              from '../../environments/environment';
import { Router }                   from '@angular/router';
import { first }                    from 'rxjs/operators';
import { IGeoLocationCreateObject } from "@modules/server.common/interfaces/IGeoLocation";
import { ToastController }          from "@ionic/angular";

export interface WarehouseRegistrationInput
{
	name: string;
	username: string;
	password: string;
	email: string;
	longitude: number;
	latitude: number;
	geolocation?: IGeoLocationCreateObject;
	acceptTerms?: boolean;
	contactEmail?: string;
	contactPhone?: string;
	logo?: string;
	ordersEmail?: string;
	ordersPhone?: string;
}

const defaultInput: WarehouseRegistrationInput = {
	latitude: 0,
	longitude: 0,
	name: '',
	username: '',
	password: '',
	email: ''
	
}

@Component({
	           selector: 'page-auth',
	           templateUrl: 'auth.html',
	           styleUrls: ['./auth.scss'],
           })
export class AuthPage
{
	warehouseName: string = '';
	username: string = '';
	password: string = '';
	loginLogo: string;
	registrationInput: WarehouseRegistrationInput = defaultInput;
	
	constructor(
			private authService: AuthService,
			private readonly toastController: ToastController,
			private store: Store,
			private router: Router
	)
	{
		if(!environment.production)
		{
			this.username = environment.DEFAULT_LOGIN_USERNAME;
			this.password = environment.DEFAULT_LOGIN_PASSWORD;
			this.loginLogo = environment.LOGIN_LOGO;
		}
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
				await this.presentToast("Merchant not found!");
				return;
			}
			
			this.store.warehouseId = res.warehouse.id;
			this.store.token = res.token;
			
			await this.router.navigate(['warehouse']);
		} catch(e)
		{
			console.error(e.message)
		}
	}
	
	async register()
	{
		let warehouse = {
			username: this.registrationInput.username,
			name: this.registrationInput.name,
			isActive: false,
			inStoreMode: false,
			longitude: 50,
			latitude: 50,
			contactEmail: this.registrationInput.contactEmail,
			contactPhone: this.registrationInput.contactPhone,
			geoLocation: this.registrationInput.geolocation,
			logo: this.registrationInput.logo,
			ordersEmail: this.registrationInput.ordersEmail,
			ordersPhone: this.registrationInput.ordersPhone,
			forwardOrdersUsing: []
		}
		
		const password = this.registrationInput.password;
		
		try
		{
			const res = await this.authService
			                      .register({
				                                warehouse: warehouse,
				                                password: password
			                                })
			                      .pipe(first())
			                      .toPromise();
			
			if(!res)
			{
				await this.presentToast("Пользователь не найден!");
				return;
			}
			this.store.warehouseId = res.warehouse.id;
		} catch(e)
		{
			alert(e.message);
		}
		
		await this.presentToast("Успещная регистрация");
		
		await this.router.navigate(['warehouse']);
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
