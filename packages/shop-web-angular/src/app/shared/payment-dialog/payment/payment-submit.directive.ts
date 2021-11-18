import { Directive, ElementRef, Inject, Output } from '@angular/core';
import { from, fromEvent, Observable, of }       from 'rxjs';
import { catchError, filter, share, switchMap }  from 'rxjs/operators';
import { PaymentRequestService }                 from 'app/services/payment-request.service';
import { PAYMENT_METHODS }                       from 'app/shared/tokens/payment-methods';
import { PAYMENT_OPTIONS }                       from 'app/shared/tokens/payment-options';
import { PaymentDirective }                      from '../payment/payment.directive';

export function isError(item: unknown): item is Error | DOMException
{
	return item instanceof Error || item instanceof DOMException;
}

// @dynamic
@Directive({
	           selector: '[waPaymentSubmit]',
           })
export class PaymentSubmitDirective
{
	@Output()
	waPaymentSubmit: Observable<PaymentResponse>;
	
	@Output()
	waPaymentError: Observable<Error | DOMException>;
	
	constructor(
			@Inject(PaymentDirective) paymentHost: PaymentDetailsInit,
			@Inject(PaymentRequestService) paymentRequest: PaymentRequestService,
			@Inject(ElementRef) { nativeElement }: ElementRef,
			@Inject(PAYMENT_METHODS) methods: PaymentMethodData[],
			@Inject(PAYMENT_OPTIONS) options: PaymentOptions,
	)
	{
		const requests$ = fromEvent(nativeElement, 'click').pipe(
				switchMap(
						() => from(
								paymentRequest.request(
										{ ...paymentHost },
										methods, options))
								.pipe(catchError(error => of(error))),
				),
				share(),
		);
		
		this.waPaymentSubmit = requests$.pipe(filter(response => !isError(response)));
		
		this.waPaymentError = requests$.pipe(filter(isError));
	}
}
