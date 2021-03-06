import { CommandBus, CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { routerName }                                            from '@pyro/io';
import { injectable, optional }                                  from 'inversify';
import { CustomersService }                                      from './CustomersService';
import IService                                                  from '../IService';

/**
 * AboutUs Command
 * In this experiment, we assume that text of about us could depend on userId and his device :)
 * E.g. to user A we could respond "We are ...!", to user B we could respond "We are ... Platform!", etc.
 *
 * @export
 * @class GetAboutUsCommand
 * @implements {ICommand}
 */
export class GetAboutUsCommand implements ICommand
{
	constructor(
			public readonly userId: string,
			public readonly deviceId: string,
			public readonly selectedLanguage: string
	)
	{}
}

/**
 * CQRS experimental integration
 * This service basically just listen on 'userCommandService' and execute command 'GetAboutUsCommand'
 *
 * @export
 * @class UserCommandService
 */
@injectable()
@routerName('userCommandService')
export class UserCommandService implements IService
{
	constructor(
			@optional()
			private readonly _commandBus: CommandBus
	)
	{}
	
	async exec(
			userId: string,
			deviceId: string,
			selectedLanguage: string
	): Promise<string>
	{
		return this._commandBus.execute(
				new GetAboutUsCommand(userId, deviceId, selectedLanguage)
		);
	}
}

/**
 * Handler for GetAboutUsCommand
 * Do nothing for now :)
 *
 * @export
 * @class GetAboutUsHandler
 * @implements {ICommandHandler<GetAboutUsCommand>}
 */
@CommandHandler(GetAboutUsCommand)
export class GetAboutUsHandler implements ICommandHandler<GetAboutUsCommand>
{
	constructor(private readonly _userService: CustomersService) {}
	
	async execute(command: GetAboutUsCommand)
	{
		const { userId, deviceId, selectedLanguage } = command;
		
		return this._userService.getAboutUs(
				userId,
				deviceId,
				selectedLanguage
		);
	}
}
