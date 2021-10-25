import { Injectable }              from '@angular/core';
import { Apollo }                  from 'apollo-angular';
import { Observable }              from 'rxjs';
import { map, share }              from 'rxjs/operators';
import IAdmin, { IAdminFindInput } from '@modules/server.common/interfaces/IAdmin';
import Admin                       from '@modules/server.common/entities/Admin';
import ApolloService               from '@modules/client.common.angular2/services/apollo.service';
import { GQLQuery }                from 'graphql/definitions';

@Injectable()
export class AdminsService extends ApolloService
{
	constructor(apollo: Apollo)
	{
		super(apollo, {
			serviceName:  "Merchant::AdminsService",
			pollInterval: 5000
		})
	}
	
	public getAdmin(id: string): Observable<Admin>
	{
		return this.apollo
		           .query<{
			           admin: IAdmin
		           }>({
			              query:     GQLQuery.Admin.GetById,
			              variables: { id }
		              })
		           .pipe(map((result) => <Admin>
				           this.factory(result, Admin)));
	}
	
	public getAdmins(): Observable<Admin[]>
	{
		return this.apollo
		           .watchQuery<{
			           admins: IAdmin[]
		           }>({
			              query:        GQLQuery.Admin.Find,
			              pollInterval: this.pollInterval,
		              })
		           .valueChanges
		           .pipe(
				           map((result) => <Admin[]>
						           this.factory(result, Admin)),
				           share()
		           );
	}
	
	public findAdmin(findInput?: IAdminFindInput): Observable<Admin>
	{
		return this.apollo
		           .query<{
			           admin: IAdmin
		           }>({
			              query:     GQLQuery.Admin.Find,
			              variables: { findInput }
		              })
		           .pipe(map((result) => <Admin>
				           this.factory(result, Admin)));
	}
}
