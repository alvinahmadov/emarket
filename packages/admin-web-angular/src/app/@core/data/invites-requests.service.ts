import { Injectable }                   from '@angular/core';
import { Apollo }                       from 'apollo-angular';
import { Observable }                   from 'rxjs';
import { map, share }                   from 'rxjs/operators';
import { getCountries, getCountryName } from '@modules/server.common/data/countries';
import {
	IInviteRequestCreateObject,
	IInviteRequestUpdateObject
}                                       from '@modules/server.common/interfaces/IInviteRequest';
import {
	ICoordinate,
	IGeoLocationCreateObject
}                                       from '@modules/server.common/interfaces/IGeoLocation';
import IPagingOptions                   from '@modules/server.common/interfaces/IPagingOptions';
import InviteRequest                    from '@modules/server.common/entities/InviteRequest';
import ApolloService                    from '@modules/client.common.angular2/services/apollo.service';
import { InviteRequestViewModel }       from '@app/pages/+customers/+invites/+invites-requests/invites-requests.component';
import { GQLQuery, GQLMutation }        from 'graphql/definitions';

interface IRemovedObjectResponse
{
	n: number;
	ok: number;
}

@Injectable()
export class InvitesRequestsService extends ApolloService
{
	private readonly invitesRequests$: Observable<InviteRequest[]>;
	
	constructor(apollo: Apollo)
	{
		super(apollo, {
			serviceName:  "Admin::InvitesRequestsService",
			pollInterval: 4000
		});
		this.invitesRequests$ = this.apollo
		                            .watchQuery<{
			                            invitesRequests: InviteRequest[]
		                            }>({
			                               query:        GQLQuery.InviteRequest.GetAll,
			                               pollInterval: this.pollInterval,
		                               }).valueChanges
		                            .pipe(
				                            map((result) => this.get(result)),
				                            share()
		                            );
	}
	
	public getAllInvitesRequests(): Observable<InviteRequest[]>
	{
		return this.invitesRequests$;
	}
	
	public getInvitesRequests(
			pagingOptions?: IPagingOptions,
			invited?: boolean
	): Observable<InviteRequest[]>
	{
		return this.apollo
		           .watchQuery<{
			           invitesRequests: InviteRequest[]
		           }>({
			              query:        GQLQuery.InviteRequest.GetAllWithPaging,
			              variables:    { pagingOptions, invited },
			              pollInterval: this.pollInterval,
		              }).valueChanges
		           .pipe(
				           map((result) => this.get(result)),
				           share()
		           );
	}
	
	public createInviteRequest(
			createInput: IInviteRequestCreateObject
	): Observable<InviteRequest>
	{
		return this.apollo
		           .mutate<{
			           createInviteRequest: IInviteRequestCreateObject
		           }>({
			              mutation:  GQLMutation.InviteRequest.Create,
			              variables: {
				              createInput,
			              },
		              })
		           .pipe(
				           map((result) => <InviteRequest>
						           this.factory(result, InviteRequest)),
				           share()
		           );
	}
	
	public removeByIds(ids: string[]): Observable<IRemovedObjectResponse>
	{
		return this.apollo
		           .mutate<{
			           response: IRemovedObjectResponse
		           }>({
			              mutation:  GQLMutation.InviteRequest.RemoveByIds,
			              variables: { ids },
		              })
		           .pipe(
				           map((result) => this.get(result)),
				           share()
		           );
	}
	
	public updateInviteRequest(
			id: string,
			updateInput: IInviteRequestUpdateObject
	): Observable<InviteRequest>
	{
		return this.apollo
		           .mutate<{
			           updateInput: IInviteRequestUpdateObject
		           }>
		           ({
			            mutation:  GQLMutation.InviteRequest.Update,
			            variables: {
				            id,
				            updateInput,
			            },
		            })
		           .pipe(
				           map((result) => <InviteRequest>
						           this.factory(result, InviteRequest)),
				           share()
		           );
	}
	
	public async getCreateInviteRequestObject(
			data: InviteRequestViewModel,
			locale: string = 'en-US'
	): Promise<IInviteRequestCreateObject>
	{
		const res = await this._tryFindNewAddress(
				data.house,
				data.address,
				data.city,
				Object.values(getCountries(locale)).indexOf(data.country)
		);
		
		const lat = parseFloat(Number(res.lat).toFixed(7));
		const lng = parseFloat(Number(res.lng).toFixed(7));
		
		const geoLocation: IGeoLocationCreateObject = {
			countryId:     Object.values(getCountries(locale)).indexOf(data.country),
			city:          data.city,
			streetAddress: data.address,
			house:         data.house,
			loc:           {
				type:        'Point',
				coordinates: [Number(lng), Number(lat)],
			},
		};
		
		return {
			apartment:   data.apartment,
			isManual:    true,
			geoLocation: geoLocation,
		};
	}
	
	public generateInviteRequests(defaultLng: number, defaultLat: number, qty?: number)
	{
		return this.apollo
		           .query({
			                  query:     GQLQuery.InviteRequest.Generate,
			                  variables: { qty, defaultLng, defaultLat },
		                  });
	}
	
	public async getCountOfInvitesRequests(invited?: boolean): Promise<number>
	{
		return this.apollo
		           .query<{
			           count: number
		           }>({
			              query:     GQLQuery.InviteRequest.Count,
			              variables: { invited },
		              })
		           .pipe(map(res => this.get(res)))
		           .toPromise();
	}
	
	private _tryFindNewAddress(
			house: string,
			streetAddress: string,
			city: string,
			countryId: number
	): Promise<ICoordinate>
	{
		const countryName = getCountryName('en-US', countryId);
		
		const geocoder = new google.maps.Geocoder();
		
		return new Promise((resolve) =>
		                   {
			                   geocoder.geocode(
					                   {
						                   address:               `${streetAddress} ${house}, ${city}`,
						                   componentRestrictions: {
							                   country: countryName,
						                   },
					                   },
					                   (results, status) =>
					                   {
						                   if(status === google.maps.GeocoderStatus.OK)
						                   {
							                   const place: google.maps.GeocoderResult = results[0];
							
							                   resolve(place.geometry.location.toJSON());
						                   }
						                   else
						                   {
							                   resolve({ lat: 0, lng: 0 });
						                   }
					                   }
			                   );
		                   });
	}
}
