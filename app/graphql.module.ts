import { NgModule } from "@angular/core";
import { HttpClientModule } from "@angular/common/http";
// Apollo
import { Apollo } from "apollo-angular";
import { ApolloLink, InMemoryCache } from "@apollo/client/core";
import { SchemaLink } from "@apollo/client/link/schema";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { relayStylePagination } from "@apollo/client/utilities";

function createPost() {
  return {
    id: Math.random()
      .toString(16)
      .substr(2),
    title: Math.random()
      .toString(16)
      .substr(2)
  };
}
const posts = [
  createPost(),
  createPost(),
  createPost(),
  createPost(),
  createPost(),
  createPost(),
  createPost(),
  createPost(),
  createPost(),
  createPost(),
  createPost()
];

@NgModule({
  exports: [HttpClientModule]
})
export class GraphQLModule {
  constructor(apollo: Apollo) {
    // create Apollo
    apollo.create({
      link: ApolloLink.from([
        new ApolloLink((op, next) => {
          console.log("GraphQL Request", op.operationName, op.variables);
          return next(op);
        }),
        new SchemaLink({
          schema: makeExecutableSchema({
            typeDefs: `
              type Query {
                posts(first: Int!, after: ID): PostConnection!
              }
              
              type PageInfo {
                endCursor: ID!
                hasNextPage: Boolean!
              }

              type PostConnection {
                edges: [PostEdge!]!
                pageInfo: PageInfo!
              }

              type PostEdge {
                node: Post!
                cursor: ID!
              }
              
              type Post {
                id: ID!
                title: String!
              }
          `,
            resolvers: {
              Query: {
                posts(_, { first, after }) {
                  const indexAt = after
                    ? posts.findIndex(p => p.id === after) + 1
                    : 0;
                  return posts.slice(indexAt, indexAt + first);
                }
              },
              PostConnection: {
                edges(results) {
                  return results;
                },
                pageInfo(results) {
                  const last = results[results.length - 1];
                  return {
                    endCursor: last.id,
                    hasNextPage: posts[posts.length - 1].id !== last.id
                  };
                }
              },
              PostEdge: {
                node(result) {
                  return result;
                },
                cursor(result) {
                  return result.id;
                }
              }
            }
          })
        })
      ]),
      cache: new InMemoryCache({
        typePolicies: {
          Query: {
            fields: {
              posts: relayStylePagination()
            }
          }
        }
      })
    });
  }
}
