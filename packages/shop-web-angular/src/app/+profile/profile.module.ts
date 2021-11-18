import { NgModule }                            from '@angular/core';
import { CommonModule }                        from '@angular/common';
import { HttpClient }                          from '@angular/common/http';
import { FormsModule, ReactiveFormsModule }    from '@angular/forms';
import { RouterModule, Routes }                from '@angular/router';
import { MatIconModule }                       from '@angular/material/icon';
import { MatButtonModule }                     from '@angular/material/button';
import { MatSidenavModule }                    from '@angular/material/sidenav';
import { MatToolbarModule }                    from '@angular/material/toolbar';
import { MatCheckboxModule }                   from '@angular/material/checkbox';
import { MatListModule }                       from '@angular/material/list';
import { MatCardModule }                       from '@angular/material/card';
import { MatFormFieldModule }                  from '@angular/material/form-field';
import { MatInputModule }                      from '@angular/material/input';
import { MatSelectModule }                     from '@angular/material/select';
import { TranslateModule, TranslateLoader }    from '@ngx-translate/core';
import { TranslateHttpLoader }                 from '@ngx-translate/http-loader';
import { NgxMatSelectSearchModule }            from 'ngx-mat-select-search';
import { LazyLoadImageModule }                 from 'ng-lazyload-image';
import { MatBoldInputModule, MatSearchModule } from '@modules/material-extensions';
import { WarehouseLogoModule }                 from 'app/warehouse-logo';
import { SettingsComponent }                   from './settings/settings.component';
import { ProfileComponent }                    from './profile.component';
import { LocationSettingsComponent }           from "./location-settings/location-settings.component";
import { LocationFormComponent }               from "./location-settings/location/location.component";
import { GoogleMapComponent }                  from "app/+profile/location-settings/google-map/google-map.component";

export function HttpLoaderFactory(http: HttpClient)
{
	return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

const routes: Routes = [
	{
		path:      '',
		component: ProfileComponent,
	}
]

@NgModule({
	          declarations: [
		          ProfileComponent,
		          SettingsComponent,
		          LocationSettingsComponent,
		          LocationFormComponent,
		          GoogleMapComponent
	          ],
	          imports: [
		          CommonModule,
		          RouterModule.forChild(routes),
		          TranslateModule.forChild({
			                                   loader: {
				                                   provide:    TranslateLoader,
				                                   useFactory: HttpLoaderFactory,
				                                   deps:       [HttpClient],
			                                   },
		                                   }),
		          MatFormFieldModule,
		          MatInputModule,
		          MatSelectModule,
		          FormsModule,
		          LazyLoadImageModule,
		          WarehouseLogoModule,
		          MatIconModule,
		          MatSidenavModule,
		          MatToolbarModule,
		          MatListModule,
		          MatCardModule,
		          MatSearchModule,
		          MatBoldInputModule,
		          NgxMatSelectSearchModule,
		          MatCheckboxModule,
		          ReactiveFormsModule,
		          MatButtonModule,
	          ],
          })
export class ProfileModule
{
	static readonly routes = routes
}
