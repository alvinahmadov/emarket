import { NgModule }                from '@angular/core';
import { RouterModule }            from '@angular/router';
import { TranslateModule }         from '@ngx-translate/core';
import { WarehousesService }       from '@app/@core/data/warehouses.service';
import { SignInRedirectComponent } from './sign-in-redirect.component';

@NgModule({
	          imports:      [
		          RouterModule.forChild([
			                                { path: '', component: SignInRedirectComponent },
		                                ]),
		          TranslateModule,
	          ],
	          declarations: [SignInRedirectComponent],
	          providers:    [WarehousesService],
          })
export class SignInRedirectModule {}
