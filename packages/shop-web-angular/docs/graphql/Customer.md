**Запрос:**

`customer`- запросить определенного клиента, пользователя.

**Параметры:**

`id: string` - идентификатор пользователя, обязательна.

**Результат:**

`Customer | null`

**GraphQL:**

```graphql
query($id: String!)
{
	customer(id: $id)
	{
		...
	}
}
```

___

**Запрос:**

`findCustomers`- поиск клиентов.

**Параметры:**

`findInput: CustomerFindInput` - фильтр поиска.

`pagingOptions: PagingOptionsInput` - опции для пагинации в показе.

**Результат:**

`Array<Customer> | null`

**GraphQL:**

```graphql
query(
	$findInput: CustomerFindInput
	$pagingOptions: PagingOptionsInput
)
{
	findCustomers(findInput: $findInput, pagingOptions: $pagingOptions)
	{
		...
	}
}
```

```graphql
# фильтр для поиска клиента
input CustomerFindInput {
	id: String # идентификатор клиента
	username: String # имя пользователя
	email: String # почта пользователя
	avatar: String # ссылка на автарку в CloudInary
	firstName: String # настоящее имя клиента
	lastName: String # фамилия клиента
	role: String # роль
	phone: String # номер телефона клиента
	apartment: String # апартаменты
}

# сортировка пагинации
input PagingSortInput {
	field: String! # сортировать по полю
	sortBy: String! # по убыванию, по возрастанию
}

# пагинация поиска
input PagingOptionsInput {
	limit: Int # сколько элементов брать
	skip: Int # сколько игнорировать
	sort: PagingSortInput # сортировка
}

```

___

**Запрос:**

`customers`- запросить всех клиентов.

**Параметры:**

`pagingOptions: PagingOptionsInput` - опции для пагинации в показе, необязательный.

**Результат:**

`Customer[] | null`

**GraphQL:**

```graphql
query($pagingOptions: PagingOptionsInput)
{
	customers(pagingOptions: $pagingOptions)
	{
		...
	}
}
```

```graphql
# сортировка пагинации
input PagingSortInput {
	field: String! # сортировать по полю
	sortBy: String! # по убыванию, по возрастанию
}

# пагинация поиска
input PagingOptionsInput {
	limit: Int # сколько элементов брать
	skip: Int # сколько игнорировать
	sort: PagingSortInput # сортировка
}

```

___

**Запрос:**

`isCustomerExists`- проверить существование клиента.

**Параметры:**

`conditions: CustomerMemberInput` - фильтр.

**Результат:**

`boolean`

**GraphQL:**

```graphql
query($conditions: CustomerMemberInput!)
{
	isCustomerExists(conditions: $conditions)
}
```

```graphql
input CustomerMemberInput {
	exceptCustomerId: String # исключать клиента с указанным id
	memberKey: String!
	memberValue: String!
}
```

___

**Запрос:**

`isCustomerAuthenticated`- проверить аутентификацию клиента. Тип резултата: `boolean`

**Параметры:**

`token: string` - токен авторизации клиента

**Результат:**

`boolean`

**GraphQL:**

```graphql
query($token: String!)
{
	isCustomerAuthenticated(token: $token)
}
```

**Запрос:**

`getCustomerMetrics`- заполучить метрики клиента по покупкам.

**Параметры:**

`id: string` - идентификатор клиента

**Результат:**

`CustomerMetrics`

**GraphQL:**

```graphql
query($id: String!)
{
	getCustomerMetrics(id: $id)
	{
		...
	}
}
```

```graphql
# Метрики клиента
type CustomerMetrics {
	canceledOrders: Int # кол-во отмененных заказов
	completedOrdersTotalSum: Float # общая сумма завершенных заказов
	totalOrders: Int # общее кол-во заказов
}
```

___

**Запрос:**

`customerLogin` - авторизация клиента

**Параметры:**

`authInfo` - имя пользователя или почта пользователя;

`password` - пароль пользователя от учетной записи;

`expiresIn` - срок действительности токена авторизации. Возможные варианты (см. [JsonWebtoken](https://www.npmjs.com/package/jsonwebtoken)):
`7d` - 7 дней,
`1h` - час,
`3600` - в миллисекундах и т.д.

**Результат:**

`ICustomerLoginResponse` - объект клиента и токен авторизации.

```typescript
/**
 * File:
 * packages/common/src/routers/ICustomerAuthRouter.ts
 * */
interface ICustomerLoginResponse
{
	user: Customer;
	token: string;
}
```

**GraphQL:**

```graphql
mutation(
	$authInfo: String!,
	$password: String!,
	$expiresIn: Any
)
{
	customerLogin(
		authInfo: $authInfo,
		password: $password,
		expiresIn: $expiresIn
	)
	{
		user
		{
			...
		}
		token
	}
}
```

```graphql
type CustomerLoginInfo {
	user: Customer!
	token: String!
}
```

___

**Запрос:**

`registerCustomer` - регистрация клиента.

**Параметры:**

`registerInput: ICustomerRegistrationInput` - имя пользователя или почта пользователя;

**Результат:**

`Promise<Customer>` - объект клиента.

```graphql
mutation($registerInput: CustomerRegisterInput!)
{
	registerCustomer(registerInput: $registerInput)
	{
		...
	}
}
```

```graphql
input CustomerRegisterInput {
	user: CustomerCreateInput!
	password: String
}

input CustomerCreateInput {
	username: String!
	email: String!
	geoLocation: GeoLocationCreateInput!
	apartment: String!
	firstName: String
	lastName: String
	avatar: String
	phone: String
}

input GeoLocationCreateInput {
	city: String!
	countryId: Int!
	house: String!
	loc: LocInput!
	notes: String
	postcode: String
	streetAddress: String!
}

input LocInput {
	coordinates: [Float!]!
	type: String!
}
```

___

**Запрос:**

`updateCustomerPassword` - обновление пароля клиента.

**Параметры:**

`id: string` - ID пользователя;

`customerPasswordUpdateInput` - объект со старым и новым паролями;

```typescript
{
	// текущий пароль
	current: string;
	// новый пароль
	new: string
}
```

```graphql
mutation UpdateCustomerPassword(
	$id: String!
	$password: CustomerPasswordUpdateInput!
)
{
	updateCustomerPassword(id: $id , password: $password)
}
```

```graphql
input CustomerPasswordUpdateInput {
	current: String!
	new: String!
}
```

___

**Запрос:**

`updateCustomer` - обновление данных клиента.

**Параметры:**

`id: string` - ID пользователя;

`updateObject: ICustomerUpdateObject` - объект с обновленными данными клиента;

**Результат:**

`Customer`

**GraphQL:**

```graphql
mutation UpdateCustomer(
	$id: String!
	$updateObject: CustomerUpdateObjectInput!
)
{
	updateCustomer(id: $id, updateObject: $updateObject)
	{
		...
	}
}
```

```graphql
input CustomerUpdateObjectInput {
	apartment: String
	devicesIds: [String!]
	geoLocation: GeoLocationUpdateObjectInput!
	stripeCustomerId: String
}
```

___

**GraphQL Definitions:**

```graphql
scalar Date

# Мобильное устройство пользователя
type Device {
	_id: String! # идентификатор, в ts PyroObject
	channelId: String # идентификатор канала для пуш уведомлений 
	id: String! # идентификатор устройства
	language: String # язык устройства
	type: String! # тип операционной системы устройства (android, ios)
	uuid: String!
}

type Loc {
	coordinates: [Float!]! # координаты [longitude, latitude]
	type: String! # тип координаты, по умолч. "Point"
}

type GeoLocationCoordinates {
	lat: Float! # широта
	lng: Float! # долгота
}

type GeoLocation {
	_id: String # идентификатор, в ts PyroObject
	_createdAt: Date # дата создания
	_updatedAt: Date # дата обновления
	city: String! # город
	coordinates: GeoLocationCoordinates! # координаты
	countryId: Int! # ISO номер страны (РФ - 189)
	countryName: String # имя страны
	createdAt: Date # дата создания, геттер
	updatedAt: Date # дата обновления, геттер
	house: String! # дом
	id: String # идентификатор
	loc: Loc! # локация
	notes: String # заметки
	postcode: String # zipCode
	streetAddress: String! # улица
}

type Customer {
	_id: String! # идентификатор клиента, в ts PyroObject
	apartment: String! # апартаменты
	avatar: String # ссылка на автарку в CloudInary
	createdAt: Date # дата создания
	devices: [Device!]! # список устройств
	devicesIds: [String!]! # список идентификаторов устройств
	email: String! # почта пользователя
	firstName: String # настоящее имя клиента
	lastName: String # фамилия клиента
	fullAddress: String # полный адресс клиента
	fullName: String # полное имя клиента, 'firstName lastName' 
	geoLocation: GeoLocation! # геолокация пользователя
	id: String! # идентификатор клиента
	isBanned: Boolean! # статус бана пользователя
	phone: String # номер телефона клиента, если есть
	role: String # роль, всегда customer, если не открыт магазин
	username: String! # имя пользователя в системе
}
```

___

**Typescript:**

* packages/common/src/enums/Role.ts

* packages/common/src/interfaces/IUser.ts
* packages/common/src/interfaces/ICustomer.ts

* packages/common/src/entities/Customer.ts

* packages/common/src/routers/ICustomer**Router.ts
