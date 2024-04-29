import { fetchComments } from "./api";
import { useQuery } from '@tanstack/react-query';
import "./PostDetail.css";

export function PostDetail({ post, deleteMutation, updateMutation }) {
  // replace with useQuery
  const { data, isLoading, isError, error } = useQuery({ queryKey: ["postDetail", post.id], queryFn: () => fetchComments(post.id) });

  if (isError) { return <h3>Error!!!{error.toString()}</h3>}
  return (
    <>
      <h3 style={{ color: "blue" }}>{post.title}</h3>
      <div>
        <button onClick={() => deleteMutation.mutate(post.id)}>Delete</button>
        {deleteMutation.isPending && <p className='loading'>Deleting the post</p>}
        {deleteMutation.isError && <p className='error'>Error deleting the post: {deleteMutation.error.toString()}</p>}
        {deleteMutation.isSuccess && <p className='success'>Post was (not) delete</p>}
      </div>
      <div>
        <button onClick={() => updateMutation.mutate(post.id)}>Update title</button>
        {updateMutation.isPending && <p className='loading'>Updating the post</p>}
        {updateMutation.isError && <p className='error'>Error updating the post: {updateMutation.error.toString()}</p>}
        {updateMutation.isSuccess && <p className='success'>Post was (not) update</p>}
      </div>
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
