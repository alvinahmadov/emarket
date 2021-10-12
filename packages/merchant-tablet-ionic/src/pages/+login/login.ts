import { Component }   from '@angular/core';
import { Router }      from '@angular/router';
import { first }       from 'rxjs/operators';
import { Storage }     from 'services/storage.service';
import { AuthService } from 'services/auth.service';
import { environment } from 'environments/environment';

@Component({
	           selector:    'page-login',
	           styleUrls:   ['./login.scss'],
	           templateUrl: './login.html',
           })
export class LoginPage
{
	public username: string = '';
	public password: string = '';
	public loginLogo: string;
	public remember: boolean = false;
	
	constructor(
			private authService: AuthService,
			private store: Storage,
			private router: Router
	)
	{
		if(!this.remember)
		{
			localStorage.removeItem('_warehouseId');
			localStorage.removeItem('_language');
			localStorage.removeItem('token');
		}
		
		if(!environment.production)
		{
			this.username = environment.FAKE_MERCHANT_NAME;
			this.password = environment.FAKE_MERCHANT_PASSWORD;
			this.loginLogo = environment.LOGIN_LOGO;
		}
	}
	
	public async login()
	{
		const res = await this.authService
		                      .login(this.username, this.password)
		                      .pipe(first())
		                      .toPromise();
		
		if(!res)
		{
			alert('Merchant not found!');
			return;
		}
		
		if(!environment.production)
		{
			console.log(`Merchant logged in with id ${res.warehouse.id}`);
		}
		
		this.store.warehouseId = res.warehouse.id;
		this.store.token = res.token;
		
		this.router.navigate(['warehouse'])
		    .catch(console.error);
	}
	
	public remeberMe()
	{
		this.remember = !this.remember;
	}
}
