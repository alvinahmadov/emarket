import { Component }      from '@angular/core';
import { Router }         from '@angular/router';
import { first }          from 'rxjs/operators';
import { AuthService }    from '../../services/auth.service';
import { StorageService } from '../../services/storage.service';
import { environment }    from '../../environments/environment';

interface UserAuthDto
{
	username: string;
	password: string;
}

@Component({
	           selector:    'page-login',
	           templateUrl: 'login.html',
	           styleUrls:   ['login.scss'],
           })
export class LoginPage
{
	public user: UserAuthDto;
	public loginLogo: string;
	
	constructor(
			private authService: AuthService,
			private storageService: StorageService,
			private router: Router
	)
	{
		if(!environment.production)
		{
			this.user = {
				username: environment.DEFAULT_LOGIN_USERNAME,
				password: environment.DEFAULT_LOGIN_PASSWORD,
			};
		}
		this.loginLogo = environment.LOGIN_LOGO;
	}
	
	public async login()
	{
		const res = await this.authService
		                      .login(this.user.username, this.user.password)
		                      .pipe(first())
		                      .toPromise();
		
		if(!res || !res.carrier)
		{
			alert('Carrier not exists!');
			return;
		}
		
		this.storageService.carrierId = res.carrier.id;
		this.storageService.token = res.token;
		
		this.router.navigateByUrl('main', { skipLocationChange: false });
	}
}
