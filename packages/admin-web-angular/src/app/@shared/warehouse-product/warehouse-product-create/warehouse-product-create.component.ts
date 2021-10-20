import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormControl }     from '@angular/forms';
import { NgbActiveModal }                          from '@ng-bootstrap/ng-bootstrap';
import { WizardComponent }                         from '@ever-co/angular2-wizard';
import { TranslateService }                        from '@ngx-translate/core';
import { NbThemeService }                          from '@nebular/theme';
import { Subject }                                 from 'rxjs';
import { takeUntil, first }                        from 'rxjs/operators';
import { IProductCreateObject }                    from '@modules/server.common/interfaces/IProduct';
import Product                                     from '@modules/server.common/entities/Product';
import ProductsCategory                            from '@modules/server.common/entities/ProductsCategory';
import Warehouse                                   from '@modules/server.common/entities/Warehouse';
import WarehouseProduct                            from '@modules/server.common/entities/WarehouseProduct';
import { ProductsService }                         from '@app/@core/data/products.service';
import { ProductsCategoryService }                 from '@app/@core/data/productsCategory.service';
import { WarehousesService }                       from '@app/@core/data/warehouses.service';
import { NotifyService }                           from '@app/@core/services/notify/notify.service';
import { WarehouseAddChoiceComponent }             from '../forms';
import { AddWarehouseProductsComponent }           from '../forms/add-warehouse-products-table';
import { BasicInfoFormComponent }                  from '../../product/forms';
import { ProductsTableComponent }                  from '../../product/forms/products-table';

const perPage = 3;

@Component({
	           selector:    'ea-warehouse-product-create',
	           styleUrls:   ['./warehouse-product-create.component.scss'],
	           templateUrl: './warehouse-product-create.component.html',
           })
export class WarehouseProductCreateComponent implements OnInit, OnDestroy
{
	public loading: boolean;
	
	public currentThemeCosmic: boolean = false;
	
	public warehouseId: string;
	public buttons = {
		done: 'BUTTON_DONE',
		next: 'BUTTON_NEXT',
		prev: 'BUTTON_PREV',
	}
	public productsCategories: ProductsCategory[];
	public selectedWarehouse: Warehouse;
	public perPage: number;
	public choiced: string;
	
	@ViewChild('warehouseAddChoice', { static: true })
	public warehouseAddChoice: WarehouseAddChoiceComponent;
	
	@ViewChild('basicInfoForm')
	public basicInfoForm: BasicInfoFormComponent;
	
	@ViewChild('productsTable')
	public productsTable: ProductsTableComponent;
	
	@ViewChild('addWarehouseProductsTable')
	public addWarehouseProductsTable: AddWarehouseProductsComponent;
	
	@ViewChild('wizzardFrom')
	public wizzardFrom: WizardComponent;
	
	@ViewChild('wizzardFromStep1', { static: true })
	public wizzardFromStep1: any;
	public readonly form: FormGroup = this._formBuilder.group(
			{
				basicInfo: BasicInfoFormComponent.buildForm(this._formBuilder),
			}
	);
	public readonly basicInfo = this.form.get('basicInfo') as FormControl;
	public $productsTablePagesChanges: any;
	public isSetp2: boolean;
	private ngDestroy$ = new Subject<void>();
	private createdProducts: Product[] = [];
	private selectedProducts: any[] = [];
	
	constructor(
			private readonly _formBuilder: FormBuilder,
			private readonly _productsService: ProductsService,
			private readonly _warehousesService: WarehousesService,
			private readonly _activeModal: NgbActiveModal,
			private readonly _translateService: TranslateService,
			private readonly _themeService: NbThemeService,
			private readonly _productsCategoryService: ProductsCategoryService,
			private readonly _notifyService: NotifyService
	)
	{
		this.perPage = perPage;
		this.loadProductCategories();
		this.checkCurrentTheme();
	}
	
	public ngOnInit(): void
	{
		this.wizzardFromStep1.showNext = false;
		this.warehouseAddChoice.choice
		    .pipe(takeUntil(this.ngDestroy$))
		    .subscribe(async(res) =>
		               {
			               this.choiced = res;
		               });
	}
	
	public ngOnDestroy()
	{
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}
	
	public get buttonDone(): string
	{
		return this._translate(this.buttons.done);
	}
	
	public get buttonNext(): string
	{
		return this._translate(this.buttons.next);
	}
	
	public get buttonPrevious(): string
	{
		return this._translate(this.buttons.prev);
	}
	
	public get hasCoiced(): string
	{
		return this.choiced;
	}
	
	public get isValidBasicInfoForm(): boolean
	{
		return this.basicInfo && this.basicInfo.valid && this.isSetp2;
	}
	
	public hasSelectedProducts = () => false;
	
	public validAllProducts = () => false;
	
	public checkCurrentTheme()
	{
		if(this._themeService.currentTheme === 'cosmic')
		{
			this.currentThemeCosmic = true;
		}
	}
	
	public async addProducts()
	{
		this.loading = true;
		try
		{
			const productsForAdd = this.addWarehouseProductsTable.allWarehouseProducts;
			const res = await this._warehousesService
			                      .addProducts(this.warehouseId, productsForAdd)
			                      .pipe(first())
			                      .toPromise();
			this.loading = false;
			const message = `${productsForAdd.length} products was added`;
			this._notifyService.success(message);
			this.cancel();
		} catch(error)
		{
			let message = `Something went wrong`;
			if(error.message === 'Validation error')
			{
				message = error.message;
			}
			this.loading = false;
			this._notifyService.error(message);
			this.cancel();
		}
	}
	
	public async onStep1Next()
	{
		this.isSetp2 = true;
		if(this.choiced === 'existing')
		{
			this.hasSelectedProducts = () =>
			{
				if(this.productsTable)
				{
					return this.productsTable.hasSelectedProducts;
				}
				return false;
			};
			if(this.$productsTablePagesChanges)
			{
				this.$productsTablePagesChanges.unsubscribe();
			}
			
			const loadDataSmartTable = async(page = 1) =>
			{
				let existedProductsIds = this.selectedWarehouse.products.map(
						(product: WarehouseProduct) => product.productId
				);
				
				if(this.createdProducts)
				{
					for(const product of this.createdProducts)
					{
						existedProductsIds.push(product.id);
					}
				}
				
				let products = await this._productsService
				                         .getProducts(
						                         {
							                         skip:  perPage * (page - 1),
							                         limit: perPage,
						                         },
						                         existedProductsIds
				                         )
				                         .pipe(first())
				                         .toPromise();
				
				const dataCount = await this.getDataCount(existedProductsIds);
				
				this.productsTable.loadDataSmartTable(
						products,
						dataCount,
						page
				);
			};
			
			if(this.productsTable)
			{
				this.$productsTablePagesChanges = this.productsTable.pagesChanges$
				                                      .pipe(takeUntil(this.ngDestroy$))
				                                      .subscribe((page: number) =>
				                                                 {
					                                                 loadDataSmartTable(page);
				                                                 });
			}
			
			await loadDataSmartTable();
		}
	}
	
	public selectedChoice()
	{
		if(this.choiced)
		{
			this.onStep1Next();
			this.wizzardFrom.next();
		}
	}
	
	public async onStep2Next()
	{
		this.isSetp2 = false;
		if(this.choiced === 'new')
		{
			if(this.basicInfo.valid)
			{
				const productCreateObject: IProductCreateObject = await this.basicInfoForm.setupProductCreateObject();
				const product = await this._productsService
				                          .create(productCreateObject)
				                          .pipe(first())
				                          .toPromise();
				this.createdProducts.push(product);
				
				const message = `Product ${productCreateObject.title[0].value} is created`;
				this._notifyService.success(message);
			}
		}
		else
		{
			this.selectedProducts = this.productsTable.selectedProducts;
		}
		const newCreatedProducts = this.createdProducts.map((p) =>
		                                                    {
			                                                    return {
				                                                    id:    p.id,
				                                                    title: p.title[0].value,
			                                                    };
		                                                    });
		this.addWarehouseProductsTable.loadDataSmartTable(
				[...newCreatedProducts, ...this.selectedProducts],
				this.warehouseId
		);
		
		this.validAllProducts = () =>
				this.addWarehouseProductsTable.productsIsValid();
	}
	
	public onStep2Prev()
	{
		if(this.choiced === 'existing')
		{
			this.selectedProducts = [];
			this.hasSelectedProducts = () => true;
		}
		this.choiced = null;
	}
	
	public onStep3Prev()
	{
		this.isSetp2 = true;
	}
	
	public async loadProductCategories()
	{
		this.productsCategories = await this._productsCategoryService
		                                    .getCategories()
		                                    .pipe(first())
		                                    .toPromise();
	}
	
	public cancel()
	{
		this._activeModal.dismiss('canceled');
	}
	
	private async getDataCount(existedProductsIds: string[]): Promise<number>
	{
		return this._productsService.getCountOfProducts(existedProductsIds);
	}
	
	private _translate(key: string): string
	{
		let translationResult = '';
		
		this._translateService.get(key)
		    .subscribe((res) => translationResult = res);
		
		return translationResult;
	}
}
