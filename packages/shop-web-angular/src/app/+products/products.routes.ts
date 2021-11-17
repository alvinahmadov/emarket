import { Routes }                  from '@angular/router';
import { ProductDetailsComponent } from './product-details';
import { ProductCommentComponent } from './product-comments';
import { ProductsComponent }       from './products.component';

export const routes: Routes = [
	{
		path:      '',
		component: ProductsComponent,
	},
	{
		path:      'details/:warehouseId/:productId',
		component: ProductDetailsComponent,
	},
	{
		path:      'comments/:warehouseId/:warehouseProductId',
		component: ProductCommentComponent,
	}
];
