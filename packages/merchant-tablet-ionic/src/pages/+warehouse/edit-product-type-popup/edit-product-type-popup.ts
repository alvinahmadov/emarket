import {
	AfterViewInit,
	Component,
	ElementRef,
	Input,
	OnInit,
	ViewChild
}                                                      from '@angular/core';
import { ActionSheetController, ModalController }      from '@ionic/angular';
import { Camera, CameraOptions }                       from '@ionic-native/camera/ngx';
import { TranslateService }                            from '@ngx-translate/core';
import { FileItem, FileUploader, FileUploaderOptions } from 'ng2-file-upload';
import { first }                                       from 'rxjs/operators';
import {
	IProductDescription,
	IProductImage,
	IProductTitle
}                                                      from '@modules/server.common/interfaces/IProduct';
import { ILocaleMember }                               from '@modules/server.common/interfaces/ILocale';
import DeliveryType                                    from '@modules/server.common/enums/DeliveryType';
import Currency                                        from '@modules/server.common/entities/Currency';
import WarehouseProduct                                from '@modules/server.common/entities/WarehouseProduct';
import Product                                         from '@modules/server.common/entities/Product';
import ProductsCategory                                from '@modules/server.common/entities/ProductsCategory';
import { ProductLocalesService }                       from '@modules/client.common.angular2/locale/product-locales.service';
import { ProductRouter }                               from '@modules/client.common.angular2/routers/product-router.service';
import { WarehouseProductsRouter }                     from '@modules/client.common.angular2/routers/warehouse-products-router.service';
import { WarehouseRouter }                             from '@modules/client.common.angular2/routers/warehouse-router.service';
import { ProductsCategoryService }                     from 'services/products-category.service';
import { StorageService }                              from 'services/storage.service';
import { environment }                                 from 'environments/environment';
import { ProductImagesPopup }                          from '../product-pictures-popup/product-images-popup.component';
import ProductTypePopup                                from '../../../@shared/common/product-type-popup';

@Component({
	           selector:    'page-edit-product-type-popup',
	           styleUrls:   ['./edit-product-type-popup.scss'],
	           templateUrl: './edit-product-type-popup.html',
           })
export class EditProductTypePopupPage extends ProductTypePopup
		implements OnInit, AfterViewInit
{
	public OK: string = 'OK';
	public CANCEL: string = 'CANCEL';
	public SELECT_CATEGORIES: string = 'SELECT_CATEGORIES';
	public PREFIX: string = 'WAREHOUSE_VIEW.SELECT_POP_UP.';
	public selectOptionsObj: object;
	public takaProductDelivery: boolean = true;
	public takaProductTakeaway: boolean;
	public isAvailable: boolean = false;
	
	@ViewChild('imageHolder', { static: true })
	private _imageHolder: ElementRef;
	
	@Input()
	public warehouseProduct: WarehouseProduct;
	public product: Product;
	public currency: Currency;
	public readyToUpdate: boolean = false;
	public uploader: FileUploader;
	public translLang: string;
	public productsCategories: ProductsCategory[];
	public selectedProductCategories: string[] = [];
	public hasImage: boolean = true;
	
	private static cssClass = "mutation-product-images-modal";
	
	private lastProductTitle: IProductTitle[];
	private lastProductDescription: IProductDescription[];
	private lastProductPrice: number;
	private lastProductCount: number;
	public readonly locales: string[] = environment.AVAILABLE_LOCALES.split('|');
	public readonly descrMaxLength = 255;
	private imagesData: IProductImage[];
	
	@ViewChild('fileInput', { static: true })
	private fileInput: ElementRef;
	
	constructor(
			private productRouter: ProductRouter,
			private warehouseRouter: WarehouseRouter,
			private warehouseProductsRouter: WarehouseProductsRouter,
			private readonly _productsCategorySrvice: ProductsCategoryService,
			private readonly storage: StorageService,
			public modalController: ModalController,
			private camera: Camera,
			public actionSheetCtrl: ActionSheetController,
			public readonly localeTranslateService: ProductLocalesService,
			private translate: TranslateService
	)
	{
		super(modalController, storage);
		this._setupFileUploader();
	}
	
	async ngOnInit()
	{
		this.isAvailable = this.warehouseProduct.isProductAvailable;
		this.product = this.warehouseProduct.product as Product;
		this.lastProductCount = this.warehouseProduct.count;
		this.lastProductPrice = this.warehouseProduct.price;
		this.lastProductDescription = this.product.description;
		this.lastProductTitle = this.product.title;
		this.translLang = this.translate.currentLang;
		this.takaProductDelivery = this.warehouseProduct.isDeliveryRequired;
		this.takaProductTakeaway = this.warehouseProduct.isTakeaway;
		
		
		this.currentLocale =
				this.localeTranslateService.takeSelectedLang(this.translLang) ||
				environment.DEFAULT_LANGUAGE;
		this.storageService.deviceId
		this._setupLocaleServiceValidationState();
		
		this._selectExistingProductCategories();
		await this._loadProductsCategories();
	}
	
	public ngAfterViewInit(): void
	{
		const currentProductImage = this.localeTranslateService.getTranslate(
				this.product.images
		);
		
		this.hasImage = !!currentProductImage;
		
		this._setImageHolderBackground(currentProductImage);
	}
	
	public imageUrlChanged(ev)
	{
		const reader = new FileReader();
		
		reader.addEventListener('load', (e) =>
		{
			const imageBase64 = e.target['result'];
			this.hasImage = true;
			this._setImageHolderBackground(<string>imageBase64);
		});
		
		reader.readAsDataURL(ev.target.files[0]);
	}
	
	public get buttonOK()
	{
		return this._translate(this.PREFIX + this.OK);
	}
	
	public get buttonCancel()
	{
		return this._translate(this.PREFIX + this.CANCEL);
	}
	
	public get selectOptionTitle()
	{
		const title = this._translate(this.PREFIX + this.SELECT_CATEGORIES);
		this.selectOptionsObj = { subTitle: title };
		return this.selectOptionsObj;
	}
	
	public get isReadyToUpdate()
	{
		return (
				this.localeTranslateService.isServiceStateValid &&
				this.warehouseProduct.price !== null &&
				this.warehouseProduct.count !== null &&
				this.warehouseProduct.price !== 0 &&
				this.warehouseProduct.count >= 0
		);
	}
	
	get currentLocale()
	{
		return this.localeTranslateService.currentLocale;
	}
	
	set currentLocale(locale: string)
	{
		this.localeTranslateService.currentLocale = locale;
	}
	
	get productTitle()
	{
		return this.localeTranslateService.getMemberValue(this.product.title);
	}
	
	set productTitle(memberValue: string)
	{
		this.localeTranslateService.setMemberValue('title', memberValue);
	}
	
	get productDescription()
	{
		return this.localeTranslateService.getMemberValue(
				this.product.description
		);
	}
	
	set productDescription(memberValue: string)
	{
		if(memberValue.length <= this.descrMaxLength)
			this.localeTranslateService.setMemberValue('description', memberValue);
	}
	
	get productDetails()
	{
		return this.localeTranslateService.getMemberValue(
				this.product.details
		);
	}
	
	set productDetails(memberValue: string)
	{
		this.localeTranslateService.setMemberValue('details', memberValue);
	}
	
	public getProductTypeChange(type: string)
	{
		if(DeliveryType[type] === DeliveryType.Delivery)
		{
			if(!this.takaProductDelivery && !this.takaProductTakeaway)
			{
				this.takaProductTakeaway = true;
			}
		}
		else
		{
			if(!this.takaProductDelivery && !this.takaProductTakeaway)
			{
				this.takaProductDelivery = true;
			}
		}
	}
	
	public localeTranslate(member: ILocaleMember[]): string
	{
		return this.localeTranslateService.getTranslate(member);
	}
	
	public async showPicturesPopup()
	{
		let images = this.product.images.filter(
				(i) => i.locale === this.currentLocale
		);
		
		if(this.imagesData)
		{
			const imagesDataLocale = this.imagesData[0].locale;
			if(imagesDataLocale === this.currentLocale)
			{
				images = this.imagesData;
			}
		}
		
		const modal = await this.createModal(
				images,
				ProductImagesPopup,
				EditProductTypePopupPage.cssClass
		);
		
		await modal.present();
		
		const res = await modal.onDidDismiss();
		const imageArray = res.data;
		if(imageArray && imageArray.length > 0)
		{
			const firstImgUrl = imageArray[0].url;
			this._setImageHolderBackground(firstImgUrl);
			this.imagesData = imageArray;
		}
	}
	
	public takePicture(sourceType: number)
	{
		const options: CameraOptions = {
			quality:            50,
			destinationType:    this.camera.DestinationType.DATA_URL,
			encodingType:       this.camera.EncodingType.JPEG,
			mediaType:          this.camera.MediaType.PICTURE,
			correctOrientation: true,
			sourceType,
		};
		
		this.camera.getPicture(options).then(async(imageData) =>
		                                     {
			                                     const base64Image = 'data:image/jpeg;base64,' + imageData;
			                                     const file = await this.urltoFile(
					                                     base64Image,
					                                     EditProductTypePopupPage.createFileName(),
					                                     'image/jpeg'
			                                     );
			                                     const fileItem = new FileItem(this.uploader, file, {});
			                                     this.uploader.queue.push(fileItem);
		                                     });
	}
	
	public urltoFile(url, filename, mimeType)
	{
		return fetch(url)
				.then(res => res.arrayBuffer())
				.then(buf => new File([buf], filename, { type: mimeType }));
	}
	
	public async presentActionSheet()
	{
		const actionSheet =
				      await this.actionSheetCtrl
				                .create({
					                        header:  'Select Image Source',
					                        buttons: [
						                        {
							                        text:    'Load from Library',
							                        handler: () =>
							                                 {
								                                 this.takePicture(
										                                 this.camera.PictureSourceType.PHOTOLIBRARY
								                                 );
							                                 },
						                        },
						                        {
							                        text:    'Use Camera',
							                        handler: () =>
							                                 {
								                                 this.takePicture(this.camera.PictureSourceType.CAMERA);
							                                 },
						                        },
						                        { text: 'Cancel', role: 'cancel' },
					                        ],
				                        });
		await actionSheet.present();
	}
	
	public cancelModal()
	{
		this.warehouseProduct.count = this.lastProductCount;
		this.warehouseProduct.price = this.lastProductPrice;
		this.product.description = this.lastProductDescription;
		this.product.title = this.lastProductTitle;
		this.modalController.dismiss();
	}
	
	public updateProduct()
	{
		if(this.uploader.queue.length >= 1)
		{
			this.uploader.queue[this.uploader.queue.length - 1].upload();
			
			this.uploader
			    .response
			    .subscribe(
					    (res) =>
					    {
						    res = JSON.parse(res);
						
						    const locale = this.currentLocale;
						    const width = res.width;
						    const height = res.height;
						    const orientation = width !== height
						                        ? (width > height ? 2 : 1)
						                        : 0;
						    const url = res.url;
						
						    const newImage = {
							    locale,
							    url,
							    width,
							    height,
							    orientation,
						    };
						
						    if(this.product.images.length > 0)
						    {
							    this.product.images.forEach((img, index) =>
							                                {
								                                if(img.locale === locale)
								                                {
									                                this.product.images[index] = newImage;
								                                }
							                                });
						    }
						    else
						    {
							    this.product.images.push(newImage);
						    }
						
						    this.uploadProduct();
					    }
			    );
		}
		else
		{
			this.uploadProduct();
		}
	}
	
	public uploadProduct()
	{
		if(this.imagesData && this.imagesData.length > 0)
		{
			// Because all images in "imgLocale" has same local value we get first one
			const imgLocale = this.imagesData[0].locale;
			if(imgLocale === this.currentLocale)
			{
				this.product.images = this.product.images.filter(
						(i) => i.locale !== imgLocale
				);
				
				this.product.images.push(...this.imagesData);
			}
		}
		
		this.localeTranslateService.assignPropertyValue(
				this.product.title,
				'title'
		);
		this.localeTranslateService.assignPropertyValue(
				this.product.description,
				'description'
		);
		this.localeTranslateService.assignPropertyValue(
				this.product.details,
				'details'
		);
		
		this.product.categories = this.productsCategories
		                              .filter(
				                              (category) =>
						                              this.selectedProductCategories &&
						                              this.selectedProductCategories.some(
								                              (categoryId) => categoryId === category.id
						                              )
		                              )
		                              .map((category) =>
		                                   {
			                                   return {
				                                   _id:        category.id,
				                                   _createdAt: null,
				                                   _updatedAt: null,
				                                   name:       category.name,
			                                   };
		                                   });
		
		this.productRouter
		    .save(this.product)
		    .then((product: Product) =>
		          {
			          this.product = product;
			          this.warehouseProduct.product = product.id;
			          this.warehouseProduct.isDeliveryRequired = this.takaProductDelivery;
			          this.warehouseProduct.isTakeaway = this.takaProductTakeaway;
			          this.warehouseProduct.isProductAvailable = this.isAvailable;
			
			          this.warehouseProductsRouter
			              .update(this.warehouseId, this.warehouseProduct)
			              .then(() => this.modalController.dismiss());
		          });
	}
	
	private _setImageHolderBackground(imageUrl: string)
	{
		this._imageHolder.nativeElement.style.background = `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${imageUrl})`;
		this._imageHolder.nativeElement.style.backgroundSize = `cover`;
		this._imageHolder.nativeElement.style.backgroundRepeat = 'no-repeat';
		this._imageHolder.nativeElement.style.color = `white`;
	}
	
	private _translate(key: string): string
	{
		let translationResult = '';
		
		this.translate.get(key).subscribe((res) =>
		                                  {
			                                  translationResult = res;
		                                  });
		
		return translationResult;
	}
	
	private _selectExistingProductCategories()
	{
		this.selectedProductCategories =
				this.product.categories.map((category) => `${category}`) || [];
	}
	
	private _setupFileUploader()
	{
		const uploaderOptions: FileUploaderOptions = {
			url: environment.CLOUDINARY_UPLOAD_URL,
			
			// Use xhrTransport in favor of iframeTransport
			isHTML5: true,
			// Calculate progress independently for each uploaded file
			removeAfterUpload: true,
			// XHR request headers
			headers: [
				{
					name:  'X-Requested-With',
					value: 'XMLHttpRequest',
				},
			],
		};
		
		this.uploader = new FileUploader(uploaderOptions);
		
		this.uploader.onBuildItemForm = (
				fileItem: any,
				form: FormData
		): any =>
		{
			// Add Cloudinary's unsigned upload preset to the upload form
			form.append('upload_preset', environment.CLOUDINARY_UNSIGNED_UPLOAD_PRESET);
			// Add built-in and custom tags for displaying the uploaded photo in the list
			let tags: string = "product";
			if(this.product.title)
			{
				form.append('context', `photo=${this.product.title}`);
				tags += `,${this.product.title}`
			}
			
			// Upload to a custom folder
			form.append('folder', this.warehouseId);
			// Add custom tags
			form.append('tags', tags);
			// Add file to upload
			form.append('file', fileItem);
			
			// Use default "withCredentials" value for CORS requests
			fileItem.withCredentials = false;
			return { fileItem, form };
		};
	}
	
	private _setupLocaleServiceValidationState()
	{
		this.localeTranslateService.setMemberValue('title', this.productTitle);
		this.localeTranslateService.setMemberValue(
				'description',
				this.productDescription
		);
	}
	
	private async _loadProductsCategories()
	{
		this.productsCategories = await this._productsCategorySrvice
		                                    .getCategories()
		                                    .pipe(first())
		                                    .toPromise();
	}
	
	private static createFileName()
	{
		return new Date().getTime() + '.jpg';
	}
	
	clickHandler()
	{
		this.warehouseProductsRouter.changeProductAvailability(
				this.warehouseId,
				this.warehouseProduct.productId,
				this.isAvailable
		).then(res => console.debug(res.isProductAvailable));
	}
}
