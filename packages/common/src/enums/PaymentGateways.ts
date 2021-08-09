/**
 * Payment Gateways
 *
 * @enum {number}
 */
enum PaymentGateways
{
	Stripe,
	PayPal,
	YooMoney,
	Bitpay
}

export function paymentGatewaysToString(paymentGateway: PaymentGateways): string
{
	switch(paymentGateway)
	{
		case PaymentGateways.Stripe:
			return 'Stripe';
		case PaymentGateways.PayPal:
			return 'PayPal';
		case PaymentGateways.YooMoney:
			return 'YooMoney';
		case PaymentGateways.Bitpay:
			return 'Bitpay';
		default:
			return 'BAD_PAYMENT_GATEWAY';
	}
}

export function paymentGatewaysLogo(paymentGateway: PaymentGateways): string
{
	switch(paymentGateway)
	{
		case PaymentGateways.Stripe:
			return 'https://res.cloudinary.com/alvindre/image/upload/v1627956521/emarket/payment/stripe-logo_qbvwio.png';
		case PaymentGateways.PayPal:
			return 'https://res.cloudinary.com/alvindre/image/upload/v1627956520/emarket/payment/paypal-logo_klfdzh.png';
		case PaymentGateways.YooMoney:
			return 'https://res.cloudinary.com/alvindre/image/upload/v1627956521/emarket/payment/ukassa-logo_qnai6d.jpg';
		case PaymentGateways.Bitpay:
			return 'https://res.cloudinary.com/alvindre/image/upload/v1627956521/emarket/payment/bitpay-logo_n7sew5.png';
		default:
			return 'BAD_PAYMENT_GATEWAY';
	}
}

export default PaymentGateways;
