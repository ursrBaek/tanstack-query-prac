import { fetchComments } from "./api";
import { useQuery } from '@tanstack/react-query';
import "./PostDetail.css";

export function PostDetail({ post }) {
  // replace with useQuery
  const { data, isLoading, isError, error } = useQuery({ queryKey: ["postDetail", post.id], queryFn: () => fetchComments(post.id) });

  if (isError) { return <h3>Error!!!{error.toString()}</h3>}
  return (
    <>
      <h3 style={{ color: "blue" }}>{post.title}</h3>
      <button>Delete</button> <button>Update title</button>
      <p>{post.body}</p>
      <h4>Comments</h4>
      {isLoading ? "loading..." : data.map((comment) => (
        <li key={comment.id}>
          {comment.email}: {comment.body}
        </li>
      ))}
    </>
  );
}
