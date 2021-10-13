import { Component, OnInit } from '@angular/core';
import { Router }            from '@angular/router';
import { NgbActiveModal }    from '@ng-bootstrap/ng-bootstrap';
import { first }             from 'rxjs/operators';
import Carrier               from '@modules/server.common/entities/Carrier';
import { CarriersService }   from '@app/@core/data/carriers.service';

@Component({
	           styles:      ['.carrier-redirect { cursor: pointer; margin-left: 5px}'],
	           templateUrl: './carrier-info.component.html',
           })
export class CarrierTableInfoComponent implements OnInit
{
	public carrierId: string;
	public carrierData: Carrier | any = {};
	
	constructor(
			private readonly activeModal: NgbActiveModal,
			private readonly carrierService: CarriersService,
			private readonly router: Router
	)
	{}
	
	public ngOnInit(): void
	{
		this.carrierService
		    .getCarrierById(this.carrierId)
		    .pipe(first())
		    .subscribe((data) => this.carrierData = data);
	}
	
	public cancel()
	{
		this.activeModal.dismiss('canceled');
	}
	
	public redirectToCarrierPage()
	{
		this.router.navigate([`/carriers/${this.carrierId}`]);
		this.cancel();
	}
}
