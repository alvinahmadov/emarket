import { Injectable }            from '@angular/core';
import { Apollo }                from 'apollo-angular';
import { Observable }            from 'rxjs';
import { map, share }            from 'rxjs/operators';
import IComment,
{ ICommentCreateObject }         from '@modules/server.common/interfaces/IComment';
import IPagingOptions            from '@modules/server.common/interfaces/IPagingOptions';
import Comment                   from '@modules/server.common/entities/Comment';
import ApolloService             from '@modules/client.common.angular2/services/apollo.service';
import { GQLQuery, GQLMutation } from 'graphql/definitions';

@Injectable()
export class ProductCommentService extends ApolloService
{
	constructor(apollo: Apollo)
	{
		super(apollo, {
			serviceName:  "Shop::ProductCommentService",
			pollInterval: 6000,
			debug:        true
		})
	}
	
	public getComment(
			storeId: string,
			storeProductId: string,
			commentId: string
	)
	{
		return this.apollo
		           .query<{
			           comment: Comment
		           }>({
			              query:     GQLQuery.Store.Product.Comment.GetComment,
			              variables: { storeId, storeProductId, commentId }
		              })
		           .pipe(map((result) => <Comment>
				           this.factory(result, Comment)));
		
	}
	
	public getComments(
			storeId: string,
			storeProductId: string,
			pagingOptions: IPagingOptions = {}
	): Observable<Comment[]>
	{
		return this.apollo
		           .watchQuery<{
			           comments: Comment[]
		           }>({
			              query:     GQLQuery.Store.Product
					                         .Comment.GetComments,
			              variables: { storeId, storeProductId, pagingOptions }
		              })
		           .valueChanges
		           .pipe(
				           map((result) => <Comment[]>this.get(result)),
				           share()
		           );
	}
	
	public getCountOfComments(
			storeId: string,
			storeProductId: string
	): Observable<number>
	{
		return this.apollo
		           .query({
			                  query:     GQLQuery.Store.Product.Comment.Count,
			                  variables: { storeId, storeProductId }
		                  })
		           .pipe(map((result) => this.get(result)))
	}
	
	public addComment(
			storeId: string,
			storeProductId: string,
			comment: ICommentCreateObject
	): Promise<Comment[]>
	{
		return this.apollo
		           .mutate<{
			           comment: IComment[]
		           }>({
			              mutation:  GQLMutation.Store.Product.Comment.Add,
			              variables: { storeId, storeProductId, comment }
		              })
		           .pipe(map((result) =>
		                     {
			                     console.debug(result);
			                     return <Comment[]>
					                     this.factory(result, Comment)
		                     }))
		           .toPromise();
	}
	
	public saveComment(
			storeId: string,
			storeProductId: string,
			commentId: string,
			comment: any
	): Observable<Comment>
	{
		return this.apollo
		           .mutate<{
			           comment: Comment
		           }>({
			              mutation:  GQLMutation.Store.Product.Comment.Save,
			              variables: { storeId, storeProductId, commentId, comment }
		              })
		           .pipe(map((result) =>
				                     <Comment>this.factory(result, Comment))
		           );
	}
	
	public deleteCommentsByIds(
			storeId: string,
			storeProductId: string,
			commentIds: string[]
	): Promise<Comment[]>
	{
		return this.apollo
		           .mutate<{
			           comments: Comment[]
		           }>({
			              mutation:  GQLMutation.Store.Product.Comment.Delete,
			              variables: { storeId, storeProductId, commentIds }
		              })
		           .pipe(map((result) => this.get(result)))
		           .toPromise();
	}
}
