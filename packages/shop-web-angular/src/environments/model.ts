import { NgModuleRef } from '@angular/core';
import {Environment} from '../../scripts/env';

export interface EnvironmentModel extends Environment
{
	ENV_PROVIDERS: any;
	decorateModuleRef(modRef: NgModuleRef<any>): NgModuleRef<any>;
}
