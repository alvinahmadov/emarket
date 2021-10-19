import {
	Component,
	Input,
	OnDestroy,
	OnInit,
	EventEmitter,
}                                                      from '@angular/core';
import { Router }                                      from '@angular/router';
import { DomSanitizer }                                from '@angular/platform-browser';
import { TranslateService }                            from '@ngx-translate/core';
import { NgbModal }                                    from '@ng-bootstrap/ng-bootstrap';
import { LocalDataSource }                             from 'ng2-smart-table';
import { forkJoin, Observable, Subject, Subscription } from 'rxjs';
import { first, takeUntil }                            from 'rxjs/operators';
import { ILocaleMember }                               from '@modules/server.common/interfaces/ILocale';
import Product                                         from '@modules/server.common/entities/Product';
import { ProductLocalesService }                       from '@modules/client.common.angular2/locale/product-locales.service';
import { ProductsService }                             from '@app/@core/data/products.service';
import { ProductsCategoryService }                     from '@app/@core/data/productsCategory.service';
import { NotifyService }                               from '@app/@core/services/notify/notify.service';
import { ProductCheckboxComponent }                    from '@app/@shared/render-component/product-checkbox/product-checkbox';
import { ProductTitleComponent }                       from '@app/@shared/render-component/product-title/product-title.component';
import { ProductImageComponent }                       from '@app/@shared/render-component/product-image/product-image.component';
import { ConfimationModalComponent }                   from '../../../confirmation-modal/confirmation-modal.component';
import { ProductCategoriesComponent }                  from '../../../render-component/product-categories/product-categories';

interface ProductViewModel
{
	id: string;
	title: string;
	description: string;
	details: string;
	categories: string[];
	images: string[];
}

// noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols
@Component({
	           selector:    'ea-products-table',
	           styleUrls:   ['./products-table.component.scss'],
	           templateUrl: './products-table.component.html',
           })
export class ProductsTableComponent implements OnInit, OnDestroy
{
	private static noInfoSign = '';
	
	@Input()
	public perPage: number = 0;
	
	@Input()
	public hiddenTableActions: boolean;
	
	@Input()
	public boxShadow: string;
	
	public settingsSmartTable: object;
	public sourceSmartTable = new LocalDataSource();
	public selectProducts$: EventEmitter<any> = new EventEmitter();
	public pagesChanges$: EventEmitter<number> = new EventEmitter();
	public loading: boolean;
	public $subSlectProducts: Subscription;
	public confirmSub$: Subscription;
	
	private products: Product[];
	private categoriesInfo: any;
	private dataCount: number;
	private _selectedProducts: ProductViewModel[] = [];
	private ngDestroy$ = new Subject<void>();
	
	constructor(
			private readonly _sanitizer: DomSanitizer,
			private readonly _productsService: ProductsService,
			private readonly _router: Router,
			private readonly _translateService: TranslateService,
			private readonly _productLocalesService: ProductLocalesService,
			private readonly _productsCategoryService: ProductsCategoryService,
			private readonly _notifyService: NotifyService,
			private readonly modalService: NgbModal
	)
	{}
	
	public ngOnInit(): void
	{
		this.getCategories();
		this._loadSettingsSmartTable();
		this._applyTranslationOnSmartTable();
		this.smartTableChange();
	}
	
	public ngOnDestroy()
	{
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}
	
	public get selectedProducts()
	{
		return [...this._selectedProducts];
	}
	
	public set selectedProducts(products)
	{
		this._selectedProducts = products;
	}
	
	public get hasSelectedProducts(): boolean
	{
		return this._selectedProducts.length > 0;
	}
	
	public edit(event)
	{
		this._router.navigate(['/products/list/' + event.data.id + '/edit']);
	}
	
	public getCategories()
	{
		this._productsCategoryService
		    .getCategories()
		    .subscribe((categories) =>
		               {
			               this.categoriesInfo = categories;
			               this.loadDataSmartTable(
					               this.products || [],
					               this.dataCount || 0
			               );
		               });
	}
	
	public selectProductTmp(ev)
	{
		if(ev.data)
		{
			this.selectProducts$.emit({
				                          current: ev.data,
				                          allData: ev.source.data,
			                          });
		}
	}
	
	public async deleteProduct(event)
	{
		const activeModal = this.modalService.open(ConfimationModalComponent, {
			size:      'sm',
			container: 'nb-layout',
			backdrop:  'static',
		});
		const modalComponent: ConfimationModalComponent =
				      activeModal.componentInstance;
		
		this.confirmSub$ = await modalComponent.confirmEvent
		                                       .pipe(takeUntil(modalComponent.ngDestroy$))
		                                       .subscribe(() =>
		                                                  {
			                                                  try
			                                                  {
				                                                  this.loading = true;
				                                                  const productTitle =
						                                                        event.data.title || ProductsTableComponent.noInfoSign;
				                                                  this._productsService
				                                                      .removeByIds([event.data.id])
				                                                      .pipe(first())
				                                                      .toPromise();
				                                                  this.loading = false;
				                                                  const message = `Product ${productTitle} is deleted`;
				                                                  this._notifyService.success(message);
			                                                  } catch(error)
			                                                  {
				                                                  let message = `Something went wrong`;
				                                                  if(error.message === 'Validation error')
				                                                  {
					                                                  message = error.message;
				                                                  }
				                                                  this.loading = false;
				                                                  this._notifyService.error(message);
			                                                  }
			                                                  modalComponent.cancel();
		                                                  });
	}
	
	public async loadDataSmartTable(
			products: Product[],
			dataCount: number,
			page: number = 1
	)
	{
		this.dataCount = dataCount;
		this.products = products;
		let productsVM = products.map(
				(product) =>
				{
					return {
						checked:       this.selectedProducts.find(
								(d) => d.id === product['id']
						),
						title:
						               this.localeTranslate(product.title) ||
						               ProductsTableComponent.noInfoSign,
						description:
						               this.localeTranslate(product.description) ||
						               ProductsTableComponent.noInfoSign,
						details:       product.details[0]
						               ? this.localeTranslate(product.details) ||
						                 ProductsTableComponent.noInfoSign
						               : ProductsTableComponent.noInfoSign,
						categories:    {
							ids: product.categories,
							search:
							     this.categoriesInfo &&
							     this.categoriesInfo
							         .filter((c) => product.categories.includes(c.id))
							         .map((c) =>
									              this._productLocalesService.getTranslate(c.name)
							         )
							         .toString(),
						},
						image:
						               this.localeTranslate(product.images) ||
						               ProductsTableComponent.noInfoSign,
						id:            product.id,
						allCategories: this.categoriesInfo,
					};
				}
		);
		productsVM = productsVM.filter((p) => p);
		if(this.$subSlectProducts)
		{
			this.$subSlectProducts.unsubscribe();
		}
		this.$subSlectProducts = this.selectProducts$
		                             .pipe(takeUntil(this.ngDestroy$))
		                             .subscribe(({ current, allData }) =>
		                                        {
			                                        allData.find((d) => d && d.id === current['id'])[
					                                        'checked'
					                                        ] = !current.checked;
			
			                                        if(current.checked)
			                                        {
				                                        this._selectedProducts.push(current);
			                                        }
			                                        else
			                                        {
				                                        this._selectedProducts = this._selectedProducts.filter(
						                                        (p) => p.id !== current.id
				                                        );
			                                        }
			                                        this.sourceSmartTable.load(allData);
		                                        });
		
		const productsData = new Array(dataCount);
		productsData.splice(
				this.perPage * (page - 1),
				this.perPage,
				...productsVM
		);
		await this.sourceSmartTable.load(productsData);
	}
	
	protected localeTranslate(member: ILocaleMember[])
	{
		return this._productLocalesService.getTranslate(member);
	}
	
	private async smartTableChange()
	{
		this.sourceSmartTable
		    .onChanged()
		    .pipe(takeUntil(this.ngDestroy$))
		    .subscribe(async(event) =>
		               {
			               if(event.action === 'page')
			               {
				               const page = event.paging.page;
				               this.pagesChanges$.emit(page);
			               }
		               });
	}
	
	private _loadSettingsSmartTable()
	{
		const columnTitlePrefix = 'WAREHOUSE_VIEW.SELECT_PRODUCTS.';
		const getTranslate = (name: string): Observable<string | any> =>
				this._translateService.get(columnTitlePrefix + name);
		
		forkJoin(
				this._translateService.get('Id'),
				getTranslate('TITLE'),
				getTranslate('DESCRIPTION'),
				getTranslate('DETAILS'),
				getTranslate('IMAGES'),
				getTranslate('CATEGORY')
		)
				.pipe(takeUntil(this.ngDestroy$))
				.subscribe(([id, name, description, details, images, category]) =>
				           {
					           this.settingsSmartTable = {
						           actions: !this.hiddenTableActions && {
							           add:      false,
							           position: 'left',
						           },
						           edit:    {
							           editButtonContent: '<i class="ion-md-create"></i>',
						           },
						           delete:  {
							           deleteButtonContent: '<i class="ion-md-trash"></i>',
							           confirmDelete:       true,
						           },
						           mode:    'external',
						           columns: {
							           checkbox:    {
								           title:           '',
								           filter:          false,
								           type:            'custom',
								           renderComponent: ProductCheckboxComponent,
							           },
							           title:       {
								           title:           name,
								           type:            'custom',
								           renderComponent: ProductTitleComponent,
							           },
							           description: { title: description },
							           details:     { title: details },
							           categories:  {
								           title:           category,
								           type:            'custom',
								           renderComponent: ProductCategoriesComponent,
								           filterFunction(
										           cell?: any,
										           search?: string
								           ): boolean
								           {
									           return !!cell.search.includes(search);
								           },
							           },
							           images:      {
								           title:           images,
								           type:            'custom',
								           renderComponent: ProductImageComponent,
							           },
						           },
						           pager:   {
							           display: true,
							           perPage: this.perPage,
						           },
					           };
				           });
	}
	
	private _applyTranslationOnSmartTable()
	{
		this._translateService.onLangChange
		    .pipe(takeUntil(this.ngDestroy$))
		    .subscribe(() =>
		               {
			               this._loadSettingsSmartTable();
			               this.loadDataSmartTable(
					               this.products || [],
					               this.dataCount || 0
			               );
		               });
	}
}
