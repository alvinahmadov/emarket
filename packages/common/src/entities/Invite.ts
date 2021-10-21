import { Entity, Column }                                from 'typeorm';
import GeoLocation                                       from './GeoLocation';
import { DBObject, Schema, ModelName, Types, getSchema } from '../@pyro/db';
import IInvite                                           from '../interfaces/IInvite';
import { IInviteCreateObject }                           from '../interfaces/IInvite';

/**
 * Invite for potential Customer
 * Created as result of aproval of the Invite Request
 *
 * @class Invite
 * @extends {DBObject<IInvite, IInviteCreateObject>}
 * @implements {IInvite}
 */
@ModelName('Invite')
@Entity({ name: 'invites' })
class Invite extends DBObject<IInvite, IInviteCreateObject> implements IInvite
{
	/**
	 * Invite code (usually just 4 digit number), which
	 * Customer can use to continue registration
	 * Note: invite code works only within specific
	 * radius location around customer address!
	 *
	 * @type {string}
	 * @memberof Invite
	 */
	@Types.String()
	@Column()
	code: string;
	
	/**
	 * Apartment (optional) for which invite will work
	 *
	 * @type {string}
	 * @memberof Invite
	 */
	@Types.String()
	@Column()
	apartment: string;
	
	/**
	 * Location (Address) of invited Customer
	 *
	 * @type {GeoLocation}
	 * @memberof Invite
	 */
	@Schema(getSchema(GeoLocation))
	geoLocation: GeoLocation;
	
	@Types.Boolean(false)
	@Column()
	isDeleted: boolean;
	
	constructor(invite: IInvite)
	{
		super(invite);
		
		if(invite && invite.geoLocation)
		{
			this.geoLocation = new GeoLocation(invite.geoLocation);
		}
	}
	
	toInviteRequestFindObject(): {
		geoLocation: GeoLocation;
		apartment: string;
	}
	{
		return {
			geoLocation: this.geoLocation,
			apartment:   this.apartment
		};
	}
}

export default Invite;
