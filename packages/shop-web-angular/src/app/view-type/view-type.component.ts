import { Component }      from '@angular/core';
import { Router }         from '@angular/router';
import { StorageService } from 'app/services/storage';

@Component({
	           selector:    'view-type',
	           styleUrls:   ['./view-type.component.scss'],
	           templateUrl: './view-type.component.html',
           })
export class ViewTypeComponent
{
	listViewSpace: string;
	listViewType: string;
	viewType: string;
	showTuneButton: boolean = true;
	
	constructor(private storage: StorageService, private router: Router)
	{
		this.listViewSpace = this.storage.productListViewSpace || 'normal';
		this.listViewType = this.storage.productListViewType || 'masonry';
		this.viewType = this.storage.productViewType || 'list';
	}
	
	get isListView()
	{
		return this.viewType === 'list';
	}
	
	async listViewSpaceChange()
	{
		this.storage.productListViewSpace = this.listViewSpace;
		await this.reload();
	}
	
	async listViewTypeChange()
	{
		this.storage.productListViewType = this.listViewType;
		await this.reload();
	}
	
	async viewTypeChange()
	{
		this.storage.productViewType = this.viewType;
		if(this.viewType === 'carousel')
		{
			this.storage.productListViewType = 'grid';
			this.storage.productListViewSpace = 'wide';
		}
		await this.reload();
	}
	
	private async reload()
	{
		this.showTuneButton = true;
		await this.router.navigateByUrl('reload', {
			skipLocationChange: true,
		});
		await this.router.navigateByUrl('/products');
	}
}
