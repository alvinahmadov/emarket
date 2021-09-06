import { injectable }                 from 'inversify';
import faker                          from 'faker';
import { IGeoLocationCreateObject }   from '@modules/server.common/interfaces/IGeoLocation';
import { IInviteRequestCreateObject } from '@modules/server.common/interfaces/IInviteRequest';
import { IInviteCreateObject }        from '@modules/server.common/interfaces/IInvite';
import Country                        from '@modules/server.common/enums/Country';

type InviteCreateObject = {
	invitesRequestsToCreate: IInviteRequestCreateObject[];
	invitesToCreate: IInviteCreateObject[];
}

@injectable()
export class FakeInvitesService
{
	/**
	 * Generates Fake Invites, connected to Fake Invite Requests
	 *
	 * @param {number} count Number of invites to create
	 * @param {number} defaultLng Default longitude
	 * @param {number} defaultLat Default latitude
	 * @memberof InvitesService
	 */
	async generateInvitesConnectedToInviteRequests(
			count: number,
			defaultLng: number,
			defaultLat: number
	): Promise<InviteCreateObject>
	{
		const invitesToCreate: IInviteCreateObject[] = [];
		const invitesRequestsToCreate: IInviteRequestCreateObject[] = [];
		
		let inviteCount = 1;
		
		while(inviteCount <= count)
		{
			const apartment: string = `${inviteCount}`;
			const houseNumber = `${inviteCount}`;
			const geoLocation: IGeoLocationCreateObject =
					      FakeInvitesService._getInviteGeoLocationCreateObj(
							      houseNumber,
							      defaultLng,
							      defaultLat
					      );
			
			invitesRequestsToCreate.push({
				                             apartment,
				                             geoLocation,
				                             isInvited:   true,
				                             invitedDate: new Date()
			                             });
			
			invitesToCreate.push({
				                     code: `${999 + inviteCount}`,
				                     apartment,
				                     geoLocation
			                     });
			
			inviteCount += 1;
		}
		
		return {
			invitesRequestsToCreate,
			invitesToCreate
		};
	}
	
	private static _getInviteGeoLocationCreateObj(
			houseNumber: string,
			defaultLng: number,
			defaultLat: number
	): IGeoLocationCreateObject
	{
		return {
			countryId:     faker.random.number(Country.ZW) as Country,
			city:          faker.address.city(),
			house:         houseNumber,
			loc:           {
				type:        'Point',
				coordinates: [defaultLng, defaultLat]
			},
			streetAddress: faker.address.streetAddress()
		} as IGeoLocationCreateObject;
	}
}
