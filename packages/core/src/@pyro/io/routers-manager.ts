import { createLogger }            from '../../helpers/Log';
import { injectable, multiInject } from 'inversify';
import { IRouter, RouterSymbol }   from './router/router';
import { RouterHandler }           from './router/handler';
import Logger                      from 'bunyan';

export interface IRoutersManager
{
	startListening(io: SocketIO.Server);
}

@injectable()
export class RoutersManager implements IRoutersManager
{
	protected log: Logger = createLogger({ name: 'io' });
	protected io: SocketIO.Server;
	
	constructor(@multiInject(RouterSymbol) protected routers: any[]) {}
	
	async startListening(io: SocketIO.Server)
	{
		this.io = io;
		
		this.routers.forEach(async(router) =>
		                     {
			                     await this.startRouterListening(router);
		                     });
	}
	
	private async startRouterListening(router: IRouter)
	{
		try
		{
			const routerHandler = new RouterHandler(this.io, router, this.log);
			await routerHandler.listen();
		} catch(err)
		{
			this.log.fatal('Couldn\'t start router listening!', { err });
		}
	}
}
