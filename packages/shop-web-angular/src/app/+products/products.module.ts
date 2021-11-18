import { NgModule }                                      from '@angular/core';
import { CommonModule }                                  from '@angular/common';
import { HttpClient }                                    from '@angular/common/http';
import { RouterModule }                                  from '@angular/router';
import { FormsModule, ReactiveFormsModule }              from '@angular/forms';
import { MatButtonModule }                               from '@angular/material/button';
import { MatRippleModule }                               from '@angular/material/core';
import { MatCardModule }                                 from '@angular/material/card';
import { MatFormFieldModule }                            from '@angular/material/form-field';
import { MatIconModule }                                 from '@angular/material/icon';
import { MatInputModule }                                from '@angular/material/input';
import { MatGridListModule }                             from '@angular/material/grid-list';
import { MatProgressSpinnerModule }                      from '@angular/material/progress-spinner';
import { MatListModule }                                 from '@angular/material/list';
import { TranslateModule, TranslateLoader }              from '@ngx-translate/core';
import { TranslateHttpLoader }                           from '@ngx-translate/http-loader';
import { NgbModule, NgbRatingModule }                    from '@ng-bootstrap/ng-bootstrap';
import { LazyLoadImageModule }                           from 'ng-lazyload-image';
import { DragScrollModule }                              from 'ngx-drag-scroll';
import { CurrenciesService }                             from 'app/services/currencies.service';
import { GeoLocationService }                            from 'app/services/geo-location';
import { GeoLocationProductsService }                    from 'app/services/geo-location-products';
import { ProductsService }                               from 'app/services/products.service';
import { WarehouseProductsService }                      from 'app/services/warehouse-products.service';
import { WarehousesService }                             from 'app/services/warehouses';
import { ProductCategoryService }                        from 'app/services/product-category.service';
import { PipesModule }                                   from 'pipes/pipes.module';
import { ProductsCommonModule }                          from './common/common.module';
import { ProductDetailsComponent }                       from './product-details';
import { CommentListComponent, ProductCommentComponent } from './product-comments';
import { ProductsComponent }                             from './products.component';
import { routes }                                        from './products.routes';
import { StatisticsComponent }                           from './product-details/statistics/statistics.component';
import { ProductImageComponent }                         from './product-details/product-image/product-image.component';
import { CarouselViewModule }                            from './views/carousel/carousel-view.module';
import { ListViewModule }                                from './views/list/list-view.module';
import { WarehouseLogoModule }                           from '../warehouse-logo';

export function HttpLoaderFactory(http: HttpClient)
{
	return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
	          declarations: [
		          ProductsComponent,
		          ProductDetailsComponent,
		          StatisticsComponent,
		          ProductImageComponent,
		          ProductCommentComponent,
		          CommentListComponent
	          ],
	          imports:      [
		          CommonModule,
		          ProductsCommonModule,
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
		          MatGridListModule,
		          NgbRatingModule,
		          NgbModule,
		          MatListModule,
		          PipesModule,
		          MatProgressSpinnerModule,
		          ReactiveFormsModule,
		          MatRippleModule,
	          ],
	          providers:    [
		          CurrenciesService,
		          GeoLocationService,
		          GeoLocationProductsService,
		          ProductsService,
		          ProductCategoryService,
		          WarehouseProductsService,
		          WarehousesService,
	          ],
          })
export class ProductsModule
{
	public static routes = routes;
}
