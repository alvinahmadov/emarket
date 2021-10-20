import { Injectable }        from '@angular/core';
import { Apollo }            from 'apollo-angular';
import { take, map }         from 'rxjs/operators';
import { IAdminAppSettings } from '@modules/server.common/interfaces/IAppsSettings';
import ApolloService         from '@modules/client.common.angular2/services/apollo.service';
import { StorageService }    from '@app/@core/data/store.service';
import { GQLQuery }          from 'graphql/definitions';

@Injectable({
	            providedIn: 'root',
            })
export class ServerSettingsService extends ApolloService
{
	constructor(
			apollo: Apollo,
			private readonly storage: StorageService
	)
	{
		super(apollo, {
			serviceName: ""
		});
	}
	
	public async load(): Promise<boolean>
	{
		return new Promise(async(resolve) =>
		                   {
			                   const res = await this.getAdminAppSettings();
			
			                   if(res)
			                   {
				                   this.storage.adminPasswordReset = `${res.adminPasswordReset}`;
				                   this.storage.fakeDataGenerator = `${res.fakeDataGenerator}`;
			                   }
			
			                   resolve(true);
		                   });
	}
	
	public getAdminAppSettings(): Promise<IAdminAppSettings>
	{
		return this.apollo
		           .query<{
			           settings: IAdminAppSettings
		           }>({
			              query: GQLQuery.Admin.GetAppSettings,
		              })
		           .pipe(
				           take(1),
				           map((result) => this.get(result))
		           )
		           .toPromise();
	}
}
