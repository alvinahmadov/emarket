import { NgModule }                         from '@angular/core';
import { CommonModule }                     from '@angular/common';
import { ReactiveFormsModule }              from '@angular/forms';
import { MatCommonModule, MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule }               from '@angular/material/form-field';
import { MatCardModule }                    from '@angular/material/card';
import { MatInputModule }                   from '@angular/material/input';
import { MatIconModule }                    from '@angular/material/icon';
import { MatListModule }                    from '@angular/material/list';
import { MatButtonModule }                  from '@angular/material/button';
import { MatButtonToggleModule }            from '@angular/material/button-toggle';
import { MatDividerModule }                 from '@angular/material/divider';
import { TranslateModule }                  from '@ngx-translate/core';
import { NgbModule }                        from '@ng-bootstrap/ng-bootstrap';
import { ProductCommentService }            from 'app/services/product-comment.service';
import { DiscountComponent }                from './discount/discount';
import { DeliveryInfoComponent }            from './delivery-info/delivery-info';
import { TopProductsComponent }             from './top-products/top-products.component';
import { RatingComponent }                  from './rating/rating.component';
import { ProductCommentComponent }          from './product-comment/product-comment.component';
import { CommentListComponent }             from './product-comment/comment-list/comment-list.component';

// import { ReplyComponent }          from './product-comment/reply/reply.component';

@NgModule({
	          imports:      [
		          CommonModule,
		          TranslateModule.forChild(),
		          NgbModule,
		          ReactiveFormsModule,
		          MatCommonModule,
		          MatButtonModule,
		          MatInputModule,
		          MatFormFieldModule,
		          MatCardModule,
		          MatListModule,
		          MatIconModule,
		          MatButtonToggleModule,
		          MatDividerModule,
		          MatRippleModule,
	          ],
	          exports:      [
		          DiscountComponent,
		          DeliveryInfoComponent,
		          RatingComponent,
		          ProductCommentComponent,
		          // ReplyComponent
	          ],
	          declarations: [
		          DiscountComponent,
		          DeliveryInfoComponent,
		          TopProductsComponent,
		          RatingComponent,
		          ProductCommentComponent,
		          // ReplyComponent,
		          CommentListComponent
	          ],
	          providers:    [ProductCommentService]
          })
export class ProductsCommonModule {}
