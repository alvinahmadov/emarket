import { CommonModule }                     from '@angular/common';
import { HttpClient }                       from '@angular/common/http';
import { NgModule }                         from '@angular/core';
import { FormsModule }                      from '@angular/forms';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader }              from '@ngx-translate/http-loader';
import { MatButtonModule }                  from '@angular/material/button';
import { MatCardModule }                    from '@angular/material/card';
import { MatFormFieldModule }               from '@angular/material/form-field';
import { MatIconModule }                    from '@angular/material/icon';
import { MatInputModule }                   from '@angular/material/input';
import { RouterModule }                     from '@angular/router';
import { LazyLoadImageModule }              from 'ng-lazyload-image';
import { DragScrollModule }                 from 'ngx-drag-scroll';
import { GeoLocationService }               from 'app/services/geo-location';
import { GeoLocationProductsService }       from 'app/services/geo-location-products';
import { GeoLocationWarehousesService }     from 'app/services/geo-location-warehouses';
import { WarehouseProductsService }         from 'app/services/warehouse-products.service';
import { WarehousesService }                from 'app/services/warehouses';
import { WarehouseDetailsComponent }        from './warehouse-details';
import { WarehousesComponent }              from './warehouses.component';
import { routes }                           from './warehouses.routes';
import { CarouselViewModule }               from './views/carousel/carousel-view.module';
import { ListViewModule }                   from './views/list/list-view.module';
import { WarehouseLogoModule }              from '../warehouse-logo';

export function HttpLoaderFactory(http: HttpClient)
{
	return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
	          declarations: [WarehousesComponent, WarehouseDetailsComponent],
	          imports:      [
		          CommonModule,
		          TranslateModule.forChild({
			                                   loader: {
				                                   provide:    TranslateLoader,
				                                   useFactory: HttpLoaderFactory,
				                                   deps:       [HttpClient],
			                                   },
		                                   }),
		          RouterModule.forChild(routes),
		          LazyLoadImageModule,
		          WarehouseLogoModule,
		          MatCardModule,
		          MatIconModule,
		          DragScrollModule,
		          CarouselViewModule,
		          ListViewModule,
		          FormsModule,
		          MatFormFieldModule,
		          MatInputModule,
		          MatButtonModule,
	          ],
	          providers:    [
		          GeoLocationService,
		          GeoLocationProductsService,
		          GeoLocationWarehousesService,
		          WarehousesService,
		          WarehouseProductsService,
	          ],
          })
export class WarehousesModule
{
	public static routes = routes;
}
