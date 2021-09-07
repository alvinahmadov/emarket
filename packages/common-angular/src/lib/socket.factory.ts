import { Socket, SOCKET_IO } from './socket.service';
import { Inject }            from '@angular/core';

export class SocketFactory
{
	constructor(
			@Inject(SOCKET_IO)
			private readonly io: SocketIOClientStatic
	)
	{}
	
	build(socketUrl: string): Socket
	{
		return new Socket(socketUrl, this.io);
	}
}
