import { Component, Input, OnInit }           from '@angular/core';
import { EmailComposer }                      from '@ionic-native/email-composer/ngx';
import { LoadingController, ModalController } from '@ionic/angular';
import Customer                               from '@modules/server.common/entities/Customer';

@Component({
	           selector:    'customer-email-popup',
	           styleUrls:   ['./customer-email-popup.scss'],
	           templateUrl: './customer-email-popup.html',
           })
export class CustomerEmailPopupPage implements OnInit
{
	@Input()
	public customer: Customer;
	
	public email: string;
	
	constructor(
			public loadingCtrl: LoadingController,
			private emailComposer: EmailComposer,
			public modalController: ModalController
	)
	{}
	
	public attemptSendMail()
	{
		if(this.emailComposer.isAvailable())
		{
			this.emailComposer
			    .isAvailable()
			    .then((available: boolean) =>
			          {
				          if(available)
				          {
					          const emailComposerOption = {
						          to: this.email,
					          };
					          this.emailComposer.open(emailComposerOption);
				          }
			          });
		}
	}
	
	public ngOnInit(): void
	{
		this.email = this.customer.email;
	}
	
	public cancelModal()
	{
		this.modalController.dismiss();
	}
}
