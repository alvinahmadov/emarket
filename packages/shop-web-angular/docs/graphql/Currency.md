**Запрос:**

`currencies`- заполучить все существующие валюты в базе данных.

**Результат:**

`Currency[] | null`

**GraphQL:**

```graphql
query
{
	currencies
	{
		code
		name
		sign
		order
	}
}
```

```graphql
type Currency {
	_id: String!
	code: String!
	name: String
	order: String
	sign: String
}
```

___

**Typescript:**

* `packages/common/src/interfaces/ICurrency.ts`

* `packages/common/src/entities/Currency.ts`

* `packages/common/src/routers/ICurrencyRouter.ts`

_**Заметки:**_ Данные о валютах только для чтения, запись запрещен.
