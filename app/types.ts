export type Author = {
  id: number;
  firstName: string;
  lastName: string;
}

export type Post = {
  id: number;
  title: string;
  votes: number;
}

export type Query = {
  posts: Post[];
}

export type Mutation = {
  upvotePost: Post;
}
