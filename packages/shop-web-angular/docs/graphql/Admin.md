**Запрос:**

`admin`- запросить администратора.

**Параметры:**

`id: string` - ID администратора.

**Результаты:**

`Admin | null`

**GraphQL:**

```graphql
query($id: String!)
{
	admin(id: $id)
	{
		...
	}
}
```

___

**Запрос:**

`adminSearch`- искать администратора для установления чата.

**Параметры:**

`findInput: AdminFindInput` - параметры для поиска, по известной почте, имени, фамилии, пользовательскому имени.

**Результаты:**

`Admin[] | Admin | null`

**GraphQL:**

```graphql
query($findInput: AdminFindInput)
{
	adminSearch(findInput: $findInput)
	{
		...
	}
}
```

```graphql
input AdminFindInput {
	email: String # электронная почта админа, тип string
	firstName: String # имя, тип string
	lastName: String # фамилия, тип string
	username: String # имя пользователя, тип string
}
```

___

**GraphQL Definitions:**

```graphql
type Admin {
	_id: String!  # идентификатор админа, тип PyroObject в ts
	id: String! # идентификатор админа, тип string
	username: String! # имя пользователя, тип string
	email: String! # электронная почта админа, тип string
	avatar: String! # аватар админа, тип string
	firstName: String # имя, тип string
	lastName: String # фамилия, тип string
	role: String # роль админа, требуется для чат сервиса,тип string
}
```

___
**Typescript:**

* `packages/common/src/interfaces/IUser.ts`;
* `packages/common/src/interfaces/IAdmin.ts`;

* `packages/common/src/entities/Admin.ts`;

* `packages/common/src/routers/IAdminRouter.ts`;

_**Заметки:**_ Данные администратора только для чтения, запись запрещен.
