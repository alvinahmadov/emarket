import { Injectable }               from '@angular/core';
import { Observable }               from 'rxjs';
import InviteRequest                from '@modules/server.common/entities/InviteRequest';
import { Apollo }                   from 'apollo-angular';
import { map, share }               from 'rxjs/operators';
import {
	IInviteRequestCreateObject,
	IInviteRequestUpdateObject,
}                                   from '@modules/server.common/interfaces/IInviteRequest';
import { getCountryName }           from '@modules/server.common/entities/GeoLocation';
import { IGeoLocationCreateObject } from '@modules/server.common/interfaces/IGeoLocation';
import { InviteRequestViewModel }   from '../../pages/+customers/+invites/+invites-requests/invites-requests.component';
import { countries }                from '@modules/server.common/data/abbreviation-to-country';
import IPagingOptions               from '@modules/server.common/interfaces/IPagingOptions';
import { GQLMutations, GQLQueries } from '@modules/server.common/utilities/graphql';

interface RemovedObject
{
	n: number;
	ok: number;
}

@Injectable()
export class InvitesRequestsService
{
	private readonly invitesRequests$: Observable<InviteRequest[]>;
	
	constructor(private readonly _apollo: Apollo)
	{
		this.invitesRequests$ = this._apollo
		                            .watchQuery<{
			                            invitesRequests: InviteRequest[]
		                            }>({
			                               query: GQLQueries.InviteRequestsAll,
			                               pollInterval: 2000,
		                               })
		                            .valueChanges.pipe(
						map((res) => res.data.invitesRequests),
						share()
				);
	}
	
	getAllInvitesRequests(): Observable<InviteRequest[]>
	{
		return this.invitesRequests$;
	}
	
	getInvitesRequests(
			pagingOptions?: IPagingOptions,
			invited?: boolean
	): Observable<InviteRequest[]>
	{
		return this._apollo
		           .watchQuery<{
			           invitesRequests: InviteRequest[]
		           }>({
			              query: GQLQueries.InviteBy,
			              variables: { pagingOptions, invited },
			              pollInterval: 2000,
		              })
		           .valueChanges.pipe(
						map((res) => res.data.invitesRequests),
						share()
				);
	}
	
	createInviteRequest(
			createInput: IInviteRequestCreateObject
	): Observable<InviteRequest>
	{
		return this._apollo
		           .mutate<{
			           createInput: IInviteRequestCreateObject
		           }>({
			              mutation: GQLMutations.InviteRequestCreate,
			              variables: {
				              createInput,
			              },
		              })
		           .pipe(
				           map((result: any) => result.data.createInviteRequest),
				           share()
		           );
	}
	
	removeByIds(ids: string[]): Observable<RemovedObject>
	{
		return this._apollo
		           .mutate({
			                   mutation: GQLMutations.InviteRequestsRemoveByIds,
			                   variables: { ids },
		                   })
		           .pipe(
				           map((result: any) => result.data.removeInvitesRequestsByIds),
				           share()
		           );
	}
	
	updateInviteRequest(
			id: string,
			updateInput: IInviteRequestUpdateObject
	): Observable<InviteRequest>
	{
		return this._apollo
		           .mutate<{
			           id: string;
			           updateInput: IInviteRequestUpdateObject
		           }>
		           ({
			            mutation: GQLMutations.InviteRequestUpdate,
			            variables: {
				            id,
				            updateInput,
			            },
		            })
		           .pipe(
				           map((result: any) => result.data.updateInviteRequest),
				           share()
		           );
	}
	
	async getCreateInviteRequestObject(data: InviteRequestViewModel)
	{
		// noinspection DuplicatedCode
		const res = await this._tryFindNewAddress(
				data.house,
				data.address,
				data.city,
				Object.values(countries).indexOf(data.country)
		);
		
		const lat = Number(res['lat']).toFixed(7);
		const lng = Number(res['lng']).toFixed(7);
		
		const geoLocation: IGeoLocationCreateObject = {
			countryId: Object.values(countries).indexOf(data.country),
			city: data.city,
			streetAddress: data.address,
			house: data.house,
			loc: {
				coordinates: [Number(lng), Number(lat)],
				type: 'Point',
			},
		};
		
		const inviteRequest: IInviteRequestCreateObject = {
			apartment: data.apartment,
			isManual: true,
			geoLocation,
		};
		
		return inviteRequest;
	}
	
	generate1000InviteRequests(defaultLng: number, defaultLat: number): any
	{
		return this._apollo.query({
			                          query: GQLQueries.InviteRequestFake,
			                          variables: { defaultLng, defaultLat },
		                          });
	}
	
	async getCountOfInvitesRequests(invited?: boolean)
	{
		const res = await this._apollo
		                      .query({
			                             query: GQLQueries.InviteRequestCount,
			                             variables: { invited },
		                             })
		                      .toPromise();
		
		return res.data['getCountOfInvitesRequests'];
	}
	
	// noinspection DuplicatedCode
	private _tryFindNewAddress(
			house: string,
			streetAddress: string,
			city: string,
			countryId: number
	)
	{
		const countryName = getCountryName(countryId);
		
		const geocoder = new google.maps.Geocoder();
		
		return new Promise((resolve, reject) =>
		                   {
			                   geocoder.geocode(
					                   {
						                   address: `${streetAddress} ${house}, ${city}`,
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
