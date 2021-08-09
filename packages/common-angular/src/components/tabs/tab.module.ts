// adapted from https://github.com/karanhudia/angular-tabs-component
import { NgModule }     from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';

import { TabComponent }  from './tab.component';
import { TabsContainer } from '../../containers/tabs-container';

@NgModule({
	          imports: [CommonModule, FormsModule],
	          declarations: [
		          TabComponent,
		          TabsContainer
	          ],
	          exports: [
		          TabComponent,
		          TabsContainer
	          ]
          })
export class TabModule {}
