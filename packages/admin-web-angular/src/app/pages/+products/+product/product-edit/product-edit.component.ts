import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Location }                                from '@angular/common';
import { ActivatedRoute, Router }                  from '@angular/router';
import { FormGroup, FormBuilder, FormControl }     from '@angular/forms';
import { ToasterService }                          from 'angular2-toaster';
import { Subject }                                 from 'rxjs';
import { takeUntil, first, switchMap }             from 'rxjs/operators';
import Product                                     from '@modules/server.common/entities/Product';
import ProductsCategory                            from '@modules/server.common/entities/ProductsCategory';
import { ProductsService }                         from '@app/@core/data/products.service';
import { ProductsCategoryService }                 from '@app/@core/data/productsCategory.service';
import { BasicInfoFormComponent }                  from '@app/@shared/product/forms/basic-info';

@Component({
	           styleUrls:   ['./product-edit.component.scss'],
	           templateUrl: './product-edit.component.html',
           })
export class ProductEditComponent implements OnInit, OnDestroy
{
	@ViewChild('basicInfoForm', { static: true })
	public basicInfoForm: BasicInfoFormComponent;
	
	public readonly form: FormGroup = this.formBuilder
	                                      .group({
		                                             basicInfo: BasicInfoFormComponent.buildForm(this.formBuilder),
	                                             });
	public storeId: string;
	public readonly basicInfo = this.form.get('basicInfo') as FormControl;
	public product: Product;
	public productsCategories: ProductsCategory[];
	public loading: boolean;
	protected product$: any;
	protected status;
	private ngDestroy$ = new Subject<void>();
	
	constructor(
			private readonly formBuilder: FormBuilder,
			private readonly activatedRoute: ActivatedRoute,
			private readonly productsService: ProductsService,
			private readonly toasterService: ToasterService,
			private readonly router: Router,
			private readonly productsCategoryService: ProductsCategoryService,
			private location: Location
	)
	{
		this.loadProductCategories();
		
		this.product$ = this.activatedRoute.params.pipe(
				switchMap((p) => this.productsService.getProductById(p.id))
		);
	}
	
	public get isProductValid()
	{
		return this.basicInfo.valid && this.status === 'changes';
	}
	
	public back()
	{
		this.location.back();
	}
	
	public ngOnInit(): void
	{
		this.basicInfoForm.productCategories = this.productsCategories;
		
		this.product$
		    .pipe(takeUntil(this.ngDestroy$))
		    .subscribe((product: Product) =>
		               {
			               this.basicInfoForm.productCategories = this.productsCategories;
			               this.basicInfoForm.setValue(product);
			               this.product = product;
			               this.changes();
		               });
	}
	
	public async changes()
	{
		this.basicInfo.valueChanges
		    .pipe(first())
		    .toPromise()
		    .then(() => this.status = 'changes');
	}
	
	public async loadProductCategories()
	{
		this.productsCategories = await this.productsCategoryService
		                                    .getCategories()
		                                    .pipe(first())
		                                    .toPromise();
	}
	
	public ngOnDestroy()
	{
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}
	
	public async updateProduct()
	{
		try
		{
			const res = await this.basicInfoForm.setupProductCreateObject();
			this.loading = true;
			
			const product: Product = (<unknown>{
				_id:         this.product.id,
				title:       res.title,
				description: res.description,
				details:     res.details,
				images:      res.images,
				categories:  res.categories,
			}) as Product;
			
			const updatedProd = await this.productsService
			                              .save(product)
			                              .pipe(first())
			                              .toPromise();
			
			this.toasterService.pop(
					'success',
					`Product ${updatedProd.title} was updated!`
			);
			this.loading = false;
			await this.router.navigate([`/products/list/${updatedProd.id}`], {
				relativeTo: this.activatedRoute,
			});
		} catch(err)
		{
			this.loading = false;
			this.toasterService.pop(
					'error',
					`Error in updating carrier: "${err.message}"`
			);
		}
	}
}
