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
			return 'https://res.cloudinary.com/alvindre/image/upload/v1636256142/payment-logos/stripe-logo.ico';
		case PaymentGateways.PayPal:
			return 'https://res.cloudinary.com/alvindre/image/upload/v1636256142/payment-logos/paypal-logo.ico';
		case PaymentGateways.YooMoney:
			return 'https://res.cloudinary.com/alvindre/image/upload/v1636256142/payment-logos/yoomoney-logo.ico';
		case PaymentGateways.Bitpay:
			return 'https://res.cloudinary.com/alvindre/image/upload/v1636256142/payment-logos/bitpay-logo.png';
		default:
			return 'BAD_PAYMENT_GATEWAY';
	}
}

export default PaymentGateways;
