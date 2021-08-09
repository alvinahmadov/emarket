import { Socket } from '../socket.service';

export class Request<T>
{
	constructor(
			private readonly socket: Socket,
			private readonly event: string,
			private readonly args: any[]
	)
	{}
	
	async run(): Promise<T>
	{
		return new Promise<T>((resolve, reject) =>
		                      {
			                      this.socket.emit(this.event, ...this.args,
			                                       (err: any, res: T | PromiseLike<T>) =>
			                                       {
				                                       if(err != null)
				                                       {
					                                       reject(Request.deserializeError(err));
				                                       }
				                                       else
				                                       {
					                                       resolve(res);
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
