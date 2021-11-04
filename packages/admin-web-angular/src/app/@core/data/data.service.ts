import { Injectable } from '@angular/core';
import { Apollo }     from 'apollo-angular';
import { map }        from 'rxjs/operators';
import ApolloService  from '@modules/client.common.angular2/services/apollo.service';
import { GQLQuery }   from 'graphql/definitions';

@Injectable()
export class DataService extends ApolloService
{
	constructor(apollo: Apollo)
	{
		super(apollo, {
			serviceName: "Admin::DataService"
		})
	}
	
	public async clearAll(): Promise<boolean>
	{
		return this.apollo
		           .query<{
			           res: boolean
		           }>({
			              query: GQLQuery.Data.ClearAll,
		              })
		           .pipe(map((result) => this.get(result)))
		           .toPromise();
	}
}
