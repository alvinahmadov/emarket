import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard }                    from '@nestjs/passport';
import { GqlExecutionContext }          from '@nestjs/graphql';
import { AuthenticationError }          from 'apollo-server-express';
import { verify }                       from 'jsonwebtoken'
import { IncomingMessage }              from 'http';
import { env }                          from '../../env';

export interface IJwtVerificationData
{
	id: string;
	role: string;
}

@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt')
{
	protected role: string;
	protected roles: string[];
	
	async canActivate(context: ExecutionContext)
	{
		const ctx = GqlExecutionContext.create(context);
		const req: IncomingMessage = ctx.getContext().req;
		
		try
		{
			const authToken: string = req.headers.authorization.split(' ')[1];
			const user = await verify(
					authToken,
					env.JWT_SECRET
			);
			this.handleRequest(null, user);
			return true;
		} catch(e)
		{
			return false
		}
	}
	
	handleRequest(err: any, user: any, info?: any, context?: any, status?: any)
	{
		if(!user)
		{
			throw new AuthenticationError('GqlAuthGuard');
		}
		
		if(this.role !== user.role)
			throw new AuthenticationError('Wrong role');
		
		if(!this.roles.includes(user.role))
			throw new AuthenticationError('Wrong role');
		
		return user;
	}
}

@Injectable()
export class GqlAdminGuard extends GqlAuthGuard
{
	protected readonly role: string = "admin";
	protected readonly roles: string[] = ["admin"];
}

@Injectable()
export class GqlWarehouseGuard extends GqlAuthGuard
{
	protected readonly role: string = "warehouse";
	protected readonly roles: string[] = ["admin", "warehouse"];
}

@Injectable()
export class GqlCustomerGuard extends GqlAuthGuard
{
	protected readonly role: string = "customer";
	protected readonly roles: string[] = ["admin", "customer"];
}
