import { Injectable } from '@angular/core';
import { Apollo }     from 'apollo-angular';
import { map }        from 'rxjs/operators';
import { GQLQueries } from "@modules/server.common/utilities/graphql";

@Injectable()
export class DataService
{
	constructor(private readonly _apollo: Apollo) {}
	
	async clearAll(): Promise<any>
	{
		// return this._apollo
		//            .query({
		// 	                  query: GQLQueries.DataClearAll,
		//                   })
		//            .pipe(map((res) => res.data['clearAll']))
		//            .toPromise();
	}
}
