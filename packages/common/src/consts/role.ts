export enum Role
{
	ADMIN    = 'admin',
	MERCHANT = 'merchant',
	CUSTOMER = 'customer'
}

declare type UserRole = 'admin' | 'merchant' | 'customer';

export default UserRole;
