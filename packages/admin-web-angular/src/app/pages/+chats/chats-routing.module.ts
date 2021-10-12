import { NgModule }             from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ChatsComponent }       from '@app/pages/+chats/chats.component';

const routes: Routes = [
	{
		path:      '',
		component: ChatsComponent
	}
];

@NgModule({
	          imports: [RouterModule.forChild(routes)],
	          exports: [RouterModule]
          })
export class ChatsRoutingModule {}
