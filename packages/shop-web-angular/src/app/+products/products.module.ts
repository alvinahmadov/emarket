import { NgModule }                         from '@angular/core';
import { CommonModule }                     from '@angular/common';
import { HttpClient }                       from '@angular/common/http';
import { RouterModule }                     from '@angular/router';
import { FormsModule }                      from '@angular/forms';
import { MatButtonModule }                  from "@angular/material/button";
import { MatCardModule }                    from '@angular/material/card';
import { MatFormFieldModule }               from '@angular/material/form-field';
import { MatIconModule }                    from '@angular/material/icon';
import { MatInputModule }                   from '@angular/material/input';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader }              from '@ngx-translate/http-loader';
import { LazyLoadImageModule }              from 'ng-lazyload-image';
import { DragScrollModule }                 from 'ngx-drag-scroll';
import { CurrenciesService }                from 'app/services/currencies.service';
import { GeoLocationService }               from 'app/services/geo-location';
import { GeoLocationProductsService }       from 'app/services/geo-location-products';
import { ProductsService }                  from 'app/services/products';
import { WarehouseProductsService }         from 'app/services/warehouse-products';
import { ProductsCommonModule }             from './common/common.module';
import { ProductDetailsComponent }          from './product-details';
import { ProductsComponent }                from './products.component';
import { routes }                           from './products.routes';
import { CarouselViewModule }               from './views/carousel/carousel-view.module';
import { ListViewModule }                   from './views/list/list-view.module';
import { WarehouseLogoModule }              from '../warehouse-logo';

export function HttpLoaderFactory(http: HttpClient)
{
	return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
	          declarations: [ProductsComponent, ProductDetailsComponent],
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
		          ProductsCommonModule,
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
		          CurrenciesService,
		          GeoLocationService,
		          GeoLocationProductsService,
		          ProductsService,
		          WarehouseProductsService
	          ],
          })
export class ProductsModule
{
	public static routes = routes;
}
