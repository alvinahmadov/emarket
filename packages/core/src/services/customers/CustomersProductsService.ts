import Handlebars                                    from 'handlebars';
import { injectable }                                from 'inversify';
import { combineLatest, of, throwError, Observable } from 'rxjs';
import {
	distinctUntilChanged,
	exhaustMap,
	publishReplay,
	refCount,
	share,
	switchMap
}                                                    from 'rxjs/operators';
import { observableListener, routerName }            from '@pyro/io';
import ICustomerProductsRouter                       from '@modules/server.common/routers/ICustomerProductsRouter';
import { observeFile }                               from '../../utils';
import { DevicesService }                            from '../devices/DevicesService';
import IService                                      from '../IService';

@injectable()
@routerName('customer-products')
export class CustomersProductsService implements ICustomerProductsRouter, IService
{
	private static templatesDirPath: string = `${__dirname}/../../../../res/templates/`;
	
	protected _placeholderTemplateFileName: string =
			          CustomersProductsService.templatesDirPath + `user_products_placeholder.hbs`;
	
	protected _placeholderTranslationsFileName: string =
			          CustomersProductsService.templatesDirPath +
			          `user_products_placeholder.json`;
	
	private readonly _placeholderTemplateString: Observable<string>;
	private readonly _placeholderTranslationsJSON: Observable<string>;
	
	constructor(protected devicesService: DevicesService)
	{
		this._placeholderTemplateString = observeFile(
				this._placeholderTemplateFileName
		).pipe(distinctUntilChanged(), publishReplay(1), refCount());
		
		this._placeholderTranslationsJSON = observeFile(
				this._placeholderTranslationsFileName
		).pipe(distinctUntilChanged(), publishReplay(1), refCount());
	}
	
	/**
	 * Returns a html representing placeholder to show in app when there are no products available.
	 *
	 * @param {string} userId
	 * @param {string} deviceId
	 * @returns {Observable<string>}
	 * @memberof CustomersProductsService
	 */
	@observableListener()
	getPlaceholder(userId: string, deviceId: string): Observable<string>
	{
		return this.devicesService.get(deviceId).pipe(
				exhaustMap((device) =>
				           {
					           if(device === null)
					           {
						           return throwError(
								           new Error(`Customer with the id ${userId} doesn't exist`)
						           );
					           }
					           else
					           {
						           return of(device);
					           }
				           }),
				distinctUntilChanged(
						(oldDevice, newDevice) =>
								oldDevice.language !== newDevice.language
				),
				switchMap((device) =>
						          combineLatest(
								          this._placeholderTemplateString,
								          this._placeholderTranslationsJSON,
								          (templateString: string, translationsJSON: string) =>
								          {
									          const translations = JSON.parse(translationsJSON);
									
									          const template = Handlebars.compile(templateString);
									
									          const language = Object.keys(
											          JSON.parse(translationsJSON)
									          ).filter((k) =>
											                   k
													                   .toLowerCase()
													                   .includes(device.language.toLowerCase())
									          )[0];
									
									          return template(translations[language]);
								          }
						          )
				),
				share()
		);
	}
}
