import { Component, ElementRef, OnInit, ViewChild }    from '@angular/core';
import { ActionSheetController, ModalController }      from '@ionic/angular';
import { Camera, CameraOptions }                       from '@ionic-native/camera/ngx';
import { TranslateService }                            from '@ngx-translate/core';
import { FileItem, FileUploader, FileUploaderOptions } from 'ng2-file-upload';
import { first }                                       from 'rxjs/operators';
import { IProductCreateObject, IProductImage, }        from '@modules/server.common/interfaces/IProduct';
import { IWarehouseProductCreateObject }               from '@modules/server.common/interfaces/IWarehouseProduct';
import DeliveryType                                    from '@modules/server.common/enums/DeliveryType';
import ProductsCategory                                from '@modules/server.common/entities/ProductsCategory';
import Warehouse                                       from '@modules/server.common/entities/Warehouse';
import { ProductRouter }                               from '@modules/client.common.angular2/routers/product-router.service';
import { WarehouseProductsRouter }                     from '@modules/client.common.angular2/routers/warehouse-products-router.service';
import { ProductLocalesService }                       from '@modules/client.common.angular2/locale/product-locales.service';
import { WarehouseRouter }                             from '@modules/client.common.angular2/routers/warehouse-router.service';
import { environment }                                 from 'environments/environment';
import { ProductsCategoryService }                     from 'services/products-category.service';
import { StorageService }                              from 'services/storage.service';
import { ProductImagesPopup }                          from '../product-pictures-popup/product-images-popup.component';
import ProductTypePopup                                from '../../../@shared/common/product-type-popup';

@Component({
	           selector:    'page-create-product-type-popup',
	           styleUrls:   ['./create-product-type-popup.scss'],
	           templateUrl: './create-product-type-popup.html',
           })
export class CreateProductTypePopupPage extends ProductTypePopup implements OnInit
{
	public selectOptionsObj: object;
	
	public productCreateObject: IProductCreateObject = {
		title:       [],
		description: [],
		details:     [],
		images:      [],
		categories:  [],
	};
	
	public isAvailable: boolean = false;
	
	public warehouseProductCreateObject: IWarehouseProductCreateObject = {
		price:        null,
		count:        null,
		product:      null,
		initialPrice: null,
	};
	public productsCategories: ProductsCategory[];
	
	public uploader: FileUploader;
	
	@ViewChild('imageHolder', { static: true })
	private _imageHolder: ElementRef;
	
	@ViewChild('fileInput', { static: true })
	public fileInput: ElementRef;
	
	constructor(
			public readonly localeTranslateService: ProductLocalesService,
			public modalCtrl: ModalController,
			public actionSheetCtrl: ActionSheetController,
			private productRouter: ProductRouter,
			private warehouseProductsRouter: WarehouseProductsRouter,
			private warehouseRouter: WarehouseRouter,
			private camera: Camera,
			private translate: TranslateService,
			private readonly _productsCategoryService: ProductsCategoryService,
			private readonly storage: StorageService
	)
	{
		super(modalCtrl, storage);
		this.loadMerchantSettings().catch(console.error);
		
		this.locale = this.translate.currentLang;
		this.currentLocale =
				this.localeTranslateService.takeSelectedLang(this.locale) ||
				environment.DEFAULT_LANGUAGE;
		this._setupFileUploader()
	}
	
	public ngOnInit()
	{
		this._loadProductsCategories();
	}
	
	public ionViewDidLoad() {}
	
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
		this.selectOptionsObj = { subHeader: title };
		return this.selectOptionsObj;
	}
	
	public get isReadyToCreate()
	{
		return (
				this.localeTranslateService.isServiceStateValid &&
				this.warehouseProductCreateObject.price !== null &&
				this.warehouseProductCreateObject.price !== 0 &&
				(this.uploader.queue[0] ||
				 (this.imagesData && this.imagesData.length > 0))
		);
	}
	
	public get currentLocale()
	{
		return this.localeTranslateService.currentLocale;
	}
	
	public set currentLocale(locale: string)
	{
		this.localeTranslateService.currentLocale = locale;
	}
	
	public get productTitle()
	{
		return this.localeTranslateService.getMemberValue(
				this.productCreateObject.title
		);
	}
	
	public set productTitle(title: string)
	{
		this.localeTranslateService.setMemberValue('title', title);
	}
	
	public get productDescription()
	{
		return this.localeTranslateService.getMemberValue(
				this.productCreateObject.description
		);
	}
	
	public set productDescription(description: string)
	{
		this.localeTranslateService.setMemberValue('description', description);
	}
	
	get productDetails()
	{
		return this.localeTranslateService.getMemberValue(
				this.productCreateObject.details
		);
	}
	
	set productDetails(memberValue: string)
	{
		if(memberValue)
		{
			if(memberValue.length > 0)
			{
				this.localeTranslateService.setMemberValue('details', memberValue);
			}
		}
	}
	
	public async showPicturesPopup()
	{
		let images: IProductImage[];
		
		if(!this.imagesData)
		{
			this.imagesData = [await this.getProductImage()];
		}
		else
		{
			const imagesDataLocale = this.imagesData[0].locale;
			
			if(imagesDataLocale !== this.currentLocale)
			{
				for(const image of this.imagesData)
				{
					image.locale = this.currentLocale;
				}
			}
		}
		
		images = this.imagesData;
		
		const modal = await this.createModal(
				images,
				ProductImagesPopup,
				CreateProductTypePopupPage.cssClass
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
	
	public getProductTypeChange(type: string)
	{
		if(DeliveryType[type] === DeliveryType.Delivery)
		{
			if(!this.productDelivery && !this.productTakeaway)
			{
				this.productTakeaway = true;
			}
		}
		else
		{
			if(!this.productDelivery && !this.productTakeaway)
			{
				this.productDelivery = true;
			}
		}
	}
	
	public async createProduct()
	{
		let productImages: IProductImage[];
		if(this.imagesData && this.imagesData.length > 0)
		{
			productImages = this.imagesData;
		}
		else
		{
			productImages = [await this.getProductImage()];
		}
		this.productCreateObject.images = productImages;
		
		this.localeTranslateService.assignPropertyValue(
				this.productCreateObject.title,
				'title'
		);
		this.localeTranslateService.assignPropertyValue(
				this.productCreateObject.description,
				'description'
		);
		
		this.localeTranslateService.assignPropertyValue(
				this.productCreateObject.details,
				'details'
		);
		
		this.productCreateObject.categories =
				this.productsCategories
				    .filter(
						    (category: ProductsCategory) =>
						    {
							    this.selectedProductCategories &&
							    this.selectedProductCategories.some(
									    (categoryId) => categoryId === category.id
							    )
						    }
				    )
				    .map((category: ProductsCategory) =>
				         {
					         return {
						         _id:        category.id,
						         _createdAt: null,
						         _updatedAt: null,
						         name:       category.name,
					         };
				         });
		
		const product = await this.productRouter.create(this.productCreateObject);
		
		this.warehouseProductCreateObject.product = product.id;
		this.warehouseProductCreateObject.initialPrice =
				this.warehouseProductCreateObject.price || 0;
		
		this.warehouseProductCreateObject.count =
				this.warehouseProductCreateObject.count || 0;
		
		this.warehouseProductCreateObject.isDeliveryRequired = this.productDelivery;
		this.warehouseProductCreateObject.isTakeaway = this.productTakeaway;
		this.warehouseProductCreateObject.isProductAvailable = this.isAvailable;
		
		await this.warehouseProductsRouter.add(this.warehouseId, [
			this.warehouseProductCreateObject,
		]);
		
		this.cancelModal();
		
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
		
		this.camera.getPicture(options).then(
				async(imageData) =>
				{
					const base64Image = 'data:image/jpeg;base64,' + imageData;
					const file = await this.urltoFile(
							base64Image,
							CreateProductTypePopupPage.createFileName(),
							'image/jpeg'
					);
					const fileItem = new FileItem(this.uploader, file, {});
					this.uploader.queue.push(fileItem);
				}
		);
	}
	
	public urltoFile(url, filename, mimeType)
	{
		return fetch(url)
				.then(function(res)
				      {
					      return res.arrayBuffer();
				      })
				.then(function(buf)
				      {
					      return new File([buf], filename, { type: mimeType });
				      });
	}
	
	public async presentActionSheet()
	{
		const actionSheet = await this.actionSheetCtrl.create({
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
		this.modalController.dismiss();
	}
	
	private _loadProductsCategories()
	{
		this._productsCategoryService
		    .getCategories()
		    .pipe(first())
		    .subscribe(categories => this.productsCategories = categories);
	}
	
	private _translate(key: string): string
	{
		let translationResult = '';
		
		this.translate.get(key).subscribe((res) => translationResult = res);
		
		return translationResult;
	}
	
	private static createFileName()
	{
		return new Date().getTime() + '.jpg';
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
			
			if(this.productCreateObject.title)
			{
				form.append('context', `photo=${this.productCreateObject.title}`);
				tags += `,${this.productCreateObject.title}`
			}
			
			if(this.selectedProductCategories?.length > 0)
			{
				this.selectedProductCategories.forEach((categoryName) => tags += ',' + categoryName);
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
	
	private _setImageHolderBackground(imageUrl: string)
	{
		this._imageHolder.nativeElement.style.background = `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${imageUrl})`;
		this._imageHolder.nativeElement.style.backgroundSize = `cover`;
		this._imageHolder.nativeElement.style.backgroundRepeat = 'no-repeat';
		this._imageHolder.nativeElement.style.color = `white`;
	}
	
	private async loadMerchantSettings()
	{
		if(this.warehouseId)
		{
			const warehouse: Warehouse = await this.getWarehouse(this.warehouseRouter)
			if(warehouse)
			{
				this.productDelivery = warehouse.productsDelivery;
				this.productTakeaway = warehouse.productsTakeaway;
			}
		}
		
		if(!this.productDelivery && !this.productTakeaway)
		{
			this.productDelivery = true;
		}
	}
	
	private getProductImage(): Promise<IProductImage>
	{
		return new Promise(async(resolve) =>
		                   {
			                   if(this.uploader.queue.length > 0)
			                   {
				                   try
				                   {
					                   this.uploader.queue[this.uploader.queue.length - 1].upload();
				                   } catch(e)
				                   {
					                   console.error(e)
				                   }
			                   }
			
			                   this.uploader.onSuccessItem = (
					                   item: any,
					                   response: string
			                   ) =>
			                   {
				                   const data = JSON.parse(response);
				                   const locale = this.currentLocale;
				                   const width = data.width;
				                   const height = data.height;
				                   const orientation =
						                         width !== height ? (width > height ? 2 : 1) : 0;
				                   const url = data.url;
				
				                   resolve({
					                           locale,
					                           url,
					                           width,
					                           height,
					                           orientation,
				                           });
			                   };
		                   });
	}
}
