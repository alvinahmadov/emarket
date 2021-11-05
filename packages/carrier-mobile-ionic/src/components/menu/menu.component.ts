import { Component, OnDestroy }              from '@angular/core';
import { Platform, MenuController }          from '@ionic/angular';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Subject }                           from 'rxjs';
import { takeUntil }                         from 'rxjs/operators';
import { StorageService }                    from 'services/storage.service';
import { environment }                       from 'environments/environment';

@Component({
	           selector:    'e-cu-menu',
	           templateUrl: './menu.component.html',
	           styleUrls:   ['./menu.component.scss'],
           })
export class MenuComponent implements OnDestroy
{
	public companyName: string;
	
	private ngDestroy$ = new Subject<void>();
	
	constructor(
			private storageService: StorageService,
			public platform: Platform,
			private translateService: TranslateService,
			private menuCtrl: MenuController
	)
	{
		this.companyName = environment.APP_NAME;
		this.translateService.onLangChange
		    .pipe(takeUntil(this.ngDestroy$))
		    .subscribe((event: LangChangeEvent) =>
		               {
			               if(event.lang === 'he')
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
	
	public get showInformationPage()
	{
		return this.storageService.showInformationPage;
	}
	
	public menuOpened() {}
	
	public ngOnDestroy()
	{
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}
}
