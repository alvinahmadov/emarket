import { Injectable } from '@angular/core';
import { Apollo }     from 'apollo-angular';
import { Observable } from 'rxjs';
import { map, share } from 'rxjs/operators';
import Admin          from '@modules/server.common/entities/Admin';
import ApolloService  from '@modules/client.common.angular2/services/apollo.service';
import { GQLQuery }   from 'graphql/definitions';

@Injectable()
export class AdminsService extends ApolloService
{
	constructor(apollo: Apollo)
	{
		super(apollo, {
			serviceName: "Shop::AdminsService",
		});
	}
	
	public getAdmin(id: string): Observable<Admin>
	{
		return this.apollo
		           .query<{
			           admin: Admin | null
		           }>({
			              query:     GQLQuery.Admin.GetById,
			              variables: { id },
		              })
		           .pipe(
				           map((res) => this.get(res)),
				           share()
		           );
	}
	
	public getAdmins(): Observable<Admin>
	{
		return this.apollo
		           .query<{
			           admins: Admin
		           }>({
			              query:     GQLQuery.Admin.Find,
			              variables: { findInput: {} }
		              })
		           .pipe(
				           map((result) => this.get(result))
		           );
	}
}
