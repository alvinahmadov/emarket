import { GraphQLDefinitionsFactory } from '@nestjs/graphql';
import { join }                      from 'path';

export function generateDefinitions()
{
	const definitionsFactory = new GraphQLDefinitionsFactory();
	definitionsFactory.generate({
		                            typePaths: ['./src/**/*.graphql'],
		                            path:      join(process.cwd(), 'src/graphql.schema.ts'),
		                            outputAs:  'interface',
	                            })
	                  .then(console.log)
	                  .catch(console.error);
}

(() =>
{
	generateDefinitions();
})()
