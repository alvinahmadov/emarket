import { Component, OnDestroy }              from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { MenuController }                    from '@ionic/angular';
import { takeUntil }                         from 'rxjs/operators';
import { Subject }                           from 'rxjs';
import { Storage }                           from 'services/storage.service';

@Component({
	           selector: 'e-cu-menu',
	           templateUrl: './menu.component.html',
	           styleUrls: ['./menu.component.scss'],
           })
export class MenuComponent implements OnDestroy
{
	private ngDestroy$ = new Subject<void>();
	
	constructor(
			private store: Storage,
			private menuCtrl: MenuController,
			private translateService: TranslateService
	)
	{
		this.translateService.onLangChange
		    .pipe(takeUntil(this.ngDestroy$))
		    .subscribe((event: LangChangeEvent) =>
		               {
			               if(event.lang.startsWith('he') || event.lang.startsWith('ar'))
			               {
				               this.menuCtrl.enable(true, 'rtl');
				               this.menuCtrl.enable(false, 'ltr');
			               }
			               else
			               {
				               this.menuCtrl.enable(true, 'ltr');
				               this.menuCtrl.enable(false, 'rtl');
			               }
		               });
	}
	
	public ngOnDestroy()
	{
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}
	
	public get maintenanceMode()
	{
		return this.store.maintenanceMode;
	}
	
	public menuOpened() {}
}
