import { Injectable }        from '@angular/core';
import { take, map }         from 'rxjs/operators';
import { Apollo }            from 'apollo-angular';
import { IAdminAppSettings } from '@modules/server.common/interfaces/IAppsSettings';
import { GQLQueries }        from "@modules/server.common/utilities/graphql";
import { Store }             from '@app/@core/data/store.service';

@Injectable({
	            providedIn: 'root',
            })
export class ServerSettingsService
{
	constructor(
			private readonly _apollo: Apollo,
			private readonly store: Store
	)
	{}
	
	async load()
	{
		return new Promise(async(resolve, reject) =>
		                   {
			                   const res = await this.getAdminAppSettings();
			
			                   if(res)
			                   {
				                   this.store.adminPasswordReset = `${res.adminPasswordReset}`;
				                   this.store.fakeDataGenerator = `${res.fakeDataGenerator}`;
			                   }
			
			                   resolve(true);
		                   });
	}
	
	getAdminAppSettings()
	{
		return this._apollo
		           .query<{
			           settings: IAdminAppSettings
		           }>({
			              query: GQLQueries.AdminAppSettings,
		              })
		           .pipe(
				           take(1),
				           map((res) => res.data.settings)
		           )
		           .toPromise();
	}
}
