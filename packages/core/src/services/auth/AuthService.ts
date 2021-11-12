import bcrypt                     from 'bcryptjs';
import { injectable, interfaces } from 'inversify';
import {
	JsonWebTokenError,
	sign,
	verify
}                                 from 'jsonwebtoken';
import {
	DBCreateObject,
	DBObject,
	DBRawObject,
	PyroObjectId
}                                 from '@pyro/db';
import { RawObject }              from '@pyro/db/db-raw-object';
import { EntityService }          from '@pyro/db-server/entity-service';
import { WrongPasswordError }     from '@modules/server.common/errors/WrongPasswordError';
import { env }                    from '../../env';

interface IAuthableCreateObject extends DBCreateObject
{
	hash?: string;
}

interface IAuthableRawObject extends DBRawObject, IAuthableCreateObject
{
	_id: PyroObjectId;
	
	hash?: string;
}

export interface IAuthable
		extends DBObject<IAuthableRawObject, IAuthableCreateObject>
{
	hash?: string;
}

interface AuthServiceConfig<T extends IAuthable>
{
	role: string;
	Entity: any;
	saltRounds: number;
}

@injectable()
export class AuthService<T extends IAuthable> extends EntityService<T>
{
	public DBObject: { new(arg: RawObject<T>): T; modelName: string };
	protected role: string;
	protected saltRounds: number;
	
	public setConfig(config: AuthServiceConfig<T>)
	{
		this.role = config.role;
		this.DBObject = config.Entity;
		this.saltRounds = config.saltRounds;
	}
	
	public async getPasswordHash(password: string): Promise<string>
	{
		return bcrypt.hash(password, this.saltRounds);
	}
	
	public async addPassword(id: T['id'], password: string)
	{
		const query: Promise<T> = this.Model
		                              .findById(id)
		                              .select('+hash')
		                              .lean()
		                              .exec();
		
		const entity = this.parse(await query);
		
		if(entity?.hash != null)
		{
			throw new Error(
					'Password already exists, please call updatePassword instead.'
			);
		}
		
		await this.savePassword(id, password);
	}
	
	public async updatePassword(
			id: T['id'],
			password: { current: string; new: string }
	): Promise<void>
	{
		const query: Promise<T> = this.Model
		                              .findById(id)
		                              .select('+hash')
		                              .lean()
		                              .exec();
		const entity = this.parse(
				await query
		);
		
		if(!(await bcrypt.compare(password.current, entity.hash)))
		{
			throw new WrongPasswordError();
		}
		
		await this.savePassword(id, password.new);
	}
	
	public async savePassword(id: T['id'], password: string)
	{
		const hash = await this.getPasswordHash(password);
		
		await this.Model.findByIdAndUpdate(id, {
			          hash
		          })
		          .lean()
		          .exec();
	}
	
	public async login(
			findObj: any,
			password: string,
			expiresIn?: string | number
	): Promise<{ entity: T; token: string } | null>
	{
		try
		{
			const query: Promise<T> = this.Model
			                              .findOne(findObj)
			                              .select('+hash')
			                              .lean()
			                              .exec()
			
			const entity = this.parse(await query);
			
			if(!entity || !(await bcrypt.compare(password, entity.hash)))
			{
				return null;
			}
			
			const token = sign(
					{ id: entity.id, role: this.role },
					env.JWT_SECRET,
					{
						expiresIn: expiresIn ?? env.JWT_EXPIRES,
					}
			);
			delete entity.hash;
			
			return {
				entity,
				token
			};
			
		} catch(e)
		{
			if(!env.isProd)
			{
				console.error({
					              where: 'Auth.login',
					              error: e
				              });
			}
		}
		
		return null;
	}
	
	/**
	 * @param {string} token - the jwt token
	 * @returns {Promise<boolean>}
	 */
	public async isAuthenticated(token: string): Promise<boolean>
	{
		try
		{
			const { id, role } = verify(token, env.JWT_SECRET) as {
				id: T['id'];
				role: string;
			};
			
			const entity = await this.Model
			                         .findById(id)
			                         .lean()
			                         .exec();
			
			if(!entity)
			{
				return false;
			}
			
			return role === this.role;
		} catch(err)
		{
			if(err instanceof JsonWebTokenError)
			{
				return false;
			}
			else
			{
				throw err;
			}
		}
	}
}

export type AuthServiceFactory = <T extends IAuthable>(config: AuthServiceConfig<T>) => AuthService<T>;

export const authServiceFactory = (context: interfaces.Context): AuthServiceFactory =>
{
	return <T extends IAuthable>(config: AuthServiceConfig<T>) =>
	{
		const authService = context.container.get<AuthService<T>>(AuthService);
		authService.setConfig(config);
		return authService;
	};
};
