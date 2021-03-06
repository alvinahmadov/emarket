import { Entity, Column }             from 'typeorm';
import { Schema, Types }              from '@pyro/db';
import { DBObject, ModelName }        from '../@pyro/db';
import IAdmin, { IAdminCreateObject } from '../interfaces/IAdmin';
import Role                           from '../enums/Role';

/**
 * Registered Admin Users (e.g. Administrators)
 * Note: not related to Customers!
 *
 * @class Admin
 * @extends {DBObject<IAdmin, IAdminCreateObject>}
 * @implements {IAdmin}
 */
@ModelName('Admin')
@Entity({ name: 'admins' })
class Admin extends DBObject<IAdmin, IAdminCreateObject> implements IAdmin
{
	/**
	 * User Email
	 *
	 * @type {string}
	 * @memberof Admin
	 */
	@Schema({ type: String, unique: true })
	@Types.String()
	@Column()
	email: string;
	
	/**
	 * Username
	 *
	 * @type {string}
	 * @memberof Admin
	 */
	@Schema({ type: String, unique: true })
	@Types.String()
	@Column()
	username: string;
	
	/**
	 * Password hash
	 *
	 * @type {string}
	 * @memberof Admin
	 */
	@Schema({ type: String, select: false })
	@Types.String()
	@Column()
	hash: string;
	
	/**
	 * User Picture (Avatar) Url
	 *
	 * @type {string}
	 * @memberof Admin
	 */
	@Types.String()
	@Column()
	avatar: string;
	
	@Types.String('admin')
	@Column()
	role: Role;
	
	/**
	 * User First Name
	 *
	 * @type {string}
	 * @memberof Admin
	 */
	@Schema({
		        type:     String,
		        required: false,
		        validate: new RegExp(`^[a-z ,.'-]+$`, 'i')
	        })
	@Column()
	firstName?: string;
	
	/**
	 * User Last Name
	 *
	 * @type {string}
	 * @memberof Admin
	 */
	@Schema({
		        type:     String,
		        required: false,
		        validate: new RegExp(`^[a-z ,.'-]+$`, 'i')
	        })
	@Column()
	lastName?: string;
	
	/**
	 * Is User Removed (Deleted)
	 *
	 * @type {boolean}
	 * @memberof Admin
	 */
	@Types.Boolean(false)
	@Column()
	isDeleted: boolean;
	
	get fullName()
	{
		if(this.firstName)
		{
			if(this.lastName)
				return `${this.firstName} ${this.lastName}`;
			
			return this.firstName;
		}
		else
		{
			return this.username ?? this.email;
		}
	}
}

export default Admin;
