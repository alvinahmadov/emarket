import { getListeners, getRouterName, IRouter } from './router';
import { ConnectionHandler }                    from '../connection-handler';
import { Listener }                             from '../listener/listener';
import Logger                                   from 'bunyan';
import SocketIO                                 from 'socket.io';

export class RouterHandler
{
	private readonly routerName: string;
	
	private readonly listeners: Array<Listener<any>>;
	
	constructor(
			private readonly io: SocketIO.Server,
			private readonly router: IRouter,
			private readonly log: Logger
	)
	{
		this.routerName = getRouterName(router);
		this.listeners = getListeners(router);
	}
	
	async listen(): Promise<void>
	{
		const listeners: string[] = this.listeners
		                            ? this.listeners
		                                  .map((listener) => listener.name)
		                            : null;
		this.log.info(`Starting router listening`, {
			routerName: this.routerName,
			listeners: listeners
		});
		
		const routerNamespace: SocketIO.Namespace = this.io.of(
				`/${this.routerName}`
		);
		
		routerNamespace.setMaxListeners(0);
		
		routerNamespace.on('connection', (socket) =>
		{
			const connectionHandler = new ConnectionHandler(
					socket,
					this.router,
					this.log
			);
			connectionHandler.handle();
		});
	}
}
