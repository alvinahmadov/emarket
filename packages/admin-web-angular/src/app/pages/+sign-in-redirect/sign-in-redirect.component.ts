import { Component }         from '@angular/core';
import { WarehousesService } from '@app/@core/data/warehouses.service';
import { Router }            from '@angular/router';

@Component({
	           template: ` <h1>{{ 'SIGN_IN_REDIRECT' | translate }}</h1> `,
           })
export class SignInRedirectComponent
{
	constructor(
			private readonly _storesService: WarehousesService,
			private readonly _router: Router
	)
	{
		this._redirectToProperPage();
	}
	
	private _redirectToProperPage()
	{
		this._storesService
		    .hasExistingStores()
		    .toPromise()
		    .then((hasExistingStores) =>
		          {
			          const routeToRedirect = hasExistingStores
			                                  ? 'dashboard'
			                                  : 'setup';
			          this._router.navigate([routeToRedirect]);
		          });
	}
}
