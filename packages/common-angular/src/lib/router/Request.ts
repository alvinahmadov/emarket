import { Socket } from '../socket.service';

/**
 * Sends socket.io requests to the backend
 * */
export class Request<T>
{
	/**
	 * @param socket {Socket} A socket service for connection
	 * @param event {string} Event name to send to backend
	 * and then resolved as a service
	 * @param args {any[]} Arguments for event
	 * */
	constructor(
			private readonly socket: Socket,
			private readonly event: string,
			private readonly args: any[]
	)
	{}
	
	/**
	 * Executes request
	 *
	 * @returns Promise<T>
	 * */
	async run(): Promise<T>
	{
		return new Promise<T>((resolve, reject) =>
		                      {
			                      this.socket.emit(this.event, ...this.args,
			                                       (err: any, res: T | PromiseLike<T>) =>
			                                       {
				                                       if(!err)
				                                       {
					                                       resolve(res);
				                                       }
				                                       else
				                                       {
					                                       reject(Request.deserializeError(err));
				                                       }
			                                       });
		                      });
	}
	
	private static deserializeError(error)
	{
		if(error.__isError__)
		{
			const _error = new Error(error.message);
			_error.name = error.name;
			return _error;
		}
		else
		{
			return error;
		}
	}
}
