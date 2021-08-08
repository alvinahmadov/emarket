// noinspection DuplicatedCode

import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Store } from '../../services/store.service';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';

@Component({
	selector: 'page-auth',
	templateUrl: 'auth.html',
	styleUrls: ['./auth.scss'],
})
export class AuthPage {
	public warehouseName: string = '';
	public username: string = '';
	public password: string = '';
	public loginLogo: string;
	public acceptTerms: boolean = false;

	public constructor(
		private authService: AuthService,
		private store: Store,
		private router: Router
	) {
		localStorage.removeItem('_warehouseId');
		localStorage.removeItem('_language');
		localStorage.removeItem('token');
		this.username = environment.DEFAULT_LOGIN_USERNAME;
		this.password = environment.DEFAULT_LOGIN_PASSWORD;
		this.loginLogo = environment.LOGIN_LOGO;
	}

	public async login() {
		const res = await this.authService
			.login(this.username, this.password)
			.pipe(first())
			.toPromise();

		if (!res) {
			alert('Merchant not found!');
			return;
		}

		console.log(`Merchant logged in with id ${res.warehouse.id}`);

		this.store.warehouseId = res.warehouse.id;
		this.store.token = res.token;

		await this.router.navigate(['warehouse']);
	}

	public async register() {
		const res = await this.authService
			.register(this.warehouseName, this.username, this.password)
			.pipe(first())
			.toPromise();

		if (!res) {
			alert('Merchant can not be registered!');
			return;
		}
		this.store.warehouseId = res.warehouse.id;

		await this.router.navigate(['warehouse']);
	}
}
