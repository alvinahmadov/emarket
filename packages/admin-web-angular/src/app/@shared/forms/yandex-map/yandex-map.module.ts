import { NgModule }           from '@angular/core';
import { YandexMapComponent } from './yandex-map.component';
import { AgmCoreModule }      from '@agm/core';
import { environment }        from 'environments/environment';

@NgModule({
	          imports: [
		          AgmCoreModule.forRoot({
			                                apiKey: environment.YANDEX_MAPS_API_KEY,
			                                libraries: ['drawing'],
		                                }),
	          ],
	          declarations: [YandexMapComponent],
	          exports: [YandexMapComponent],
          })
export class YandexMapModule {}
