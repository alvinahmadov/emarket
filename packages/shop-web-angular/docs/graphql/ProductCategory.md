**Запрос:**

`allCategories`- возвращает все категории товаров.

**GraphQL:**

```graphql
query allCategories
{
	productsCategories
	{
		...
	}
}
```

```graphql
scalar Date

type TranslateType {
	locale: String! # язык для перевода названия категории
	value: String! # значение названия категории на выбранном языке
}

type ProductsCategory {
	_id: String! # идентификатор, в ts PyroObject
	_createdAt: Date # дата создания
	_updatedAt: Date # дата обновления
	id: String! # идентификатор
	image: String # ссылка на фото категории
	name: [TranslateType!]! # список названия категории на разных языках
}
```

___

**Запрос:**

`productsCategory`- запросить определенную категорию.

**Параметры:**

`id: string` - идентификатор категории, обязательна.

**GraphQL:**

```graphql
query($id: String!)
{
	productsCategory(id: $id)
	{
		...
	}
}
```

___
**Typescript:**

* `packages/common/src/interfaces/ILocale.ts`
* `packages/common/src/interfaces/IProductsCategory.ts`

* `packages/common/src/entities/ProductsCategory.ts`
