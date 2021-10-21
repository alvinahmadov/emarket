import { Component } from '@angular/core';

@Component({
	           selector: 'no-content',
	           styles: [
		           `
                       .image-container {
                           text-align: center;
	                       width: 100%;
	                       height: 100%;
                       }

                       .not-found {
                           position: relative;
	                       margin-top: 100px;
	                       margin-bottom: 20px;
                       }
		           `
	           ],
	           template: `
		           <div class="container image-container">
			           <img class="not-found" src="https://camo.githubusercontent.com/2515d63ed9f010c45188fb16aa813f67c886fcb713f8395964abcbd22bd791ef/68747470733a2f2f6d656469612e67697068792e636f6d2f6d656469612f41394563427a64367438445a652f67697068792e676966">
<!--			           <img class="not-found" src="https://www.domainsrock.net/assets/images/resource/404.png">-->
			           <h2>
				           Страница не найдена!
			           </h2>
		           </div>
	           `,
           })
export class NoContentComponent {}
