import { IRouter }             from '../../router/router';
import { IListenerHandler }    from './handler';
import { v1 as uuid }          from 'uuid';
import _                       from 'lodash';
import Logger                  from 'bunyan';
import SocketIO                from 'socket.io';
import { BaseListenerHandler } from './base';
import { AsyncListener }       from '../async';

export class AsyncListenerHandler<T> extends BaseListenerHandler<T>
		implements IListenerHandler<T>
{
	constructor(
			private readonly router: IRouter,
			private readonly listener: AsyncListener<T>,
			private readonly socket: SocketIO.Socket,
			private readonly log: Logger
	)
	{
		super(router, listener, socket, log);
	}
	
	async handleRequest(_args: any[]): Promise<void>
	{
		const callId = uuid();
		
		const callback: (err: Error | null, data?) => void = _.last(_args);
		
		const args = this.serializer(_.initial(_args));
		
		this.logCall(callId, args);
		
		try
		{
			const data: T = await this.listener.apply(this.router, args);
			
			this.log.info(
					{
						...this.baseLogDetails,
						callId,
						result: data
					},
					`Listener completed`
			);
			
			callback(null, data);
		} catch(err)
		{
			this.log.error(
					{
						...this.baseLogDetails,
						callId,
						err
					},
					`Listener thrown error!`
			);
			
			callback(this.serializeError(err), null);
		}
	}
}
