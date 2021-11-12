import { injectable }        from 'inversify';
import { IAdminAppSettings } from '@modules/server.common/interfaces/IAppsSettings';
import { env }               from '../../env';

@injectable()
export class AppsSettingsService
{
	getAdminAppSettings(): IAdminAppSettings
	{
		return {
			adminPasswordReset: env.ADMIN_PASSWORD_RESET ? 1 : 0,
			fakeDataGenerator:  env.FAKE_DATA_GENERATOR ? 1 : 0
		};
	}
}
