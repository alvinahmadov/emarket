import {
	Component,
	Input,
	Output,
	EventEmitter,
	ViewChild,
}                                            from '@angular/core';
import { FileUploader, FileUploaderOptions } from 'ng2-file-upload';
import { environment }                       from 'environments/environment';
import { ProductLocalesService }             from '@modules/client.common.angular2/locale/product-locales.service';
import { IProductImage }                     from '@modules/server.common/interfaces/IProduct';
import { NgModel }                           from '@angular/forms';

@Component({
	           selector:    'e-cu-file-uploader',
	           styleUrls:   ['./file-uploader.component.scss'],
	           templateUrl: './file-uploader.component.html',
           })
export class FileUploaderComponent
{
	@ViewChild('shownInput', { static: true })
	public shownInput: NgModel;
	
	@Input()
	public placeholder: string;
	@Input()
	public name: string;
	@Input()
	public fileUrl: string;
	@Input()
	public customClass: string;
	@Input()
	public locale: string;
	
	@Output()
	public uploadedImgUrl: EventEmitter<string> = new EventEmitter<string>();
	@Output()
	public uploadedImgObj: EventEmitter<IProductImage> = new EventEmitter<IProductImage>();
	
	public uploader: FileUploader;
	
	private oldValue: string;
	
	constructor(
			public readonly localeTranslateService: ProductLocalesService
	)
	{}
	
	public ngOnInit(): void
	{
		this._uploaderConfig();
	}
	
	public async imageUrlChanged()
	{
		const newValue =
				      this.fileUrl &&
				      this.fileUrl.replace(this.oldValue || '', '').trim();
		
		if(this.uploader.queue.length > 0)
		{
			this.uploader.queue[this.uploader.queue.length - 1].upload();
		}
		else
		{
			const image = await this._setupImage(newValue);
			
			this.uploadedImgUrl.emit(this.fileUrl);
			this.uploadedImgObj.emit(image);
			this.oldValue = this.fileUrl;
		}
		
		this.uploader.onSuccessItem = (
				item: any,
				response: string
		) =>
		{
			const data = JSON.parse(response);
			this.fileUrl = data.url;
			const locale = this.locale;
			const width = data.width;
			const height = data.height;
			const orientation = width !== height ? (width > height ? 2 : 1) : 0;
			const url = data.url;
			
			const newImage = {
				locale,
				url,
				width,
				height,
				orientation,
			};
			
			this.uploadedImgUrl.emit(data.url);
			this.uploadedImgObj.emit(newImage);
			this.oldValue = this.fileUrl;
		};
	}
	
	private _uploaderConfig()
	{
		const uploaderOptions: FileUploaderOptions = {
			url: environment.CLOUDINARY_UPLOAD_URL,
			
			isHTML5:           true,
			removeAfterUpload: true,
			headers:           [
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
			form.append('upload_preset', environment.CLOUDINARY_UNSIGNED_UPLOAD_PRESET);
			
			let tags = 'product';
			
			if(this.name)
			{
				form.append('context', `photo=${this.name}`);
				tags += `,${this.name}`;
			}
			
			form.append('folder', 'angular_sample');
			form.append('tags', tags);
			form.append('file', fileItem);
			
			fileItem.withCredentials = false;
			
			return { fileItem, form };
		};
	}
	
	private async _setupImage(imgUrl)
	{
		try
		{
			const img = await this._getImageMeta(imgUrl);
			const width = img['width'];
			const height = img['height'];
			const orientation = width !== height ? (width > height ? 2 : 1) : 0;
			const locale = this.locale;
			const url = imgUrl;
			return {
				locale,
				url,
				width,
				height,
				orientation,
			};
		} catch(error)
		{
			return error;
		}
	}
	
	private async _getImageMeta(url)
	{
		return new Promise((resolve, reject) =>
		                   {
			                   const img = new Image();
			                   img.onload = () => resolve(img);
			                   img.onerror = () => reject(false);
			                   img.src = url;
		                   });
	}
}
