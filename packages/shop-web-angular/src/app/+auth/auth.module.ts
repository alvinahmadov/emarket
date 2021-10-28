import { CommonModule }                         from '@angular/common';
import { FormsModule, ReactiveFormsModule }     from '@angular/forms';
import { NgModule }                             from '@angular/core';
import { HttpClient }                           from '@angular/common/http';
import { RouterModule }                         from '@angular/router';
import { MatButtonModule }                      from '@angular/material/button';
import { MatCardModule }                        from '@angular/material/card';
import { MatDialogModule }                      from '@angular/material/dialog';
import { MatFormFieldModule }                   from '@angular/material/form-field';
import { MatInputModule }                       from '@angular/material/input';
import { MatTabsModule }                        from '@angular/material/tabs';
import { TranslateModule, TranslateLoader }     from '@ngx-translate/core';
import { TranslateHttpLoader }                  from '@ngx-translate/http-loader';
import { FontAwesomeModule }                    from '@fortawesome/angular-fontawesome';
import { library }                              from '@fortawesome/fontawesome-svg-core';
import { faGoogle, faFacebook, faYandex, faVk } from '@fortawesome/free-brands-svg-icons';
import { far }                                  from '@fortawesome/free-regular-svg-icons';
import { MessagePopUpModalModule }              from 'app/shared/message-pop-up/message-pop-up.module';
import { MatBoldInputModule }                   from 'modules/material-extensions';
import { MatSearchModule }                      from 'modules/material-extensions/search';
import { routes }                               from './auth.routes';
import { AuthComponent }                        from './auth.component';
import { RegisterByLocationModule }             from './by-location';
import { ByCodeModuleGuard }                    from './by-code.module.guard';
import { SocieModuleGuard }                     from './socie.module.guard';
import { CodeConfirmationModule }               from './code-confirmation/code-confirmation.module';

library.add(far);
library.add(faFacebook);
library.add(faGoogle);
library.add(faYandex);
library.add(faVk);

export function HttpLoaderFactory(http: HttpClient)
{
	return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
	          declarations: [AuthComponent],
	          imports:      [
		          CommonModule,
		          FontAwesomeModule,
		          FormsModule,
		          ReactiveFormsModule,
		          RouterModule.forChild(routes),
		          TranslateModule.forChild({
			                                   loader: {
				                                   provide:    TranslateLoader,
				                                   useFactory: HttpLoaderFactory,
				                                   deps:       [HttpClient],
			                                   },
		                                   }),
		          MessagePopUpModalModule,
		
		          MatFormFieldModule,
		          MatButtonModule,
		          MatInputModule,
		          MatDialogModule,
		          MatCardModule,
		
		          MatSearchModule,
		          MatBoldInputModule,
		
		          RegisterByLocationModule,
		          CodeConfirmationModule,
		          MatTabsModule,
	          ],
	          providers:    [ByCodeModuleGuard, SocieModuleGuard],
	          exports:      [
		          AuthComponent
	          ]
          })
export class AuthModule
{
	public static routes = routes;
}
