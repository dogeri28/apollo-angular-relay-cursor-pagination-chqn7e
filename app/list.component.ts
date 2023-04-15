import { Component, OnInit } from "@angular/core";
import { Apollo, QueryRef, gql } from "apollo-angular";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import { Post, Query } from "./types";

@Component({
  selector: "app-list",
  template: `
    <ul>
      <li *ngFor="let post of (posts | async)">
        {{ post.title }}
      </li>
    </ul>
    <button (click)="loadMore()">Load more</button>
  `
})
export class ListComponent implements OnInit {
  posts: Observable<Post[]>;
  postsRef: QueryRef<any>;
  itemsPerPage = 2;
  cursor: string;
  constructor(private apollo: Apollo) {}

  ngOnInit() {
    this.postsRef = this.apollo.watchQuery<any>({
      query: gql`
        query allPosts($first: Int!, $after: ID) {
          posts(first: $first, after: $after) {
            edges {
              node {
                id
                title
              }
              cursor
            }
            pageInfo {
              endCursor
              hasNextPage
            }
          }
        }
      `,
      variables: {
        first: this.itemsPerPage
      }
    });
    this.posts = this.postsRef.valueChanges.pipe(
      map(result => {
        this.cursor = result.data.posts.pageInfo.endCursor;
        return result.data.posts.edges.map(edge => edge.node);
      })
    );
  }

  loadMore() {
    this.postsRef.fetchMore({
      variables: {
        after: this.cursor
      }
    });
  }
}
