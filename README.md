# Tanstack Query 내용정리

## Client state VS Server state

### 클라이언트 상태

- 단순 사용자의 상태 추적
- ex) 사용자 사용언어, 테마_백그라운드 색상


### 서버 상태

- 서버에 저장되지만 클라이언트에 표시하는데 필요한 데이터
- ex) 블로그 게시물

## 리액트 쿼리의 편리한 점

- 서버로부터 가져온 데이터 관리 및 캐싱 편리
    - 캐시를 하는데 필요한 전반 작업 편리
- 데이터를 부분적으로 가져오기 좋음(페이지네이션, 무한스크롤)
- 서버에 대한 로딩, 오류 상태 제공
- 서버의 데이터 업데이트
- 동일한 데이터 구조인 경우 한번에 요청. 중복요청 제거.
- 에러의 경우 재시도.
- 쿼리 성공이나 오류시 구별해서 조치를 취할 콜백 전달.

### 사용법

- 패키지 설치
  - `npm install @tanstack/react-query`
- query client 생성
    - 쿼리와 캐시를 관리
- Query Provider 적용
    - 자식 컴포넌트에 캐시 및 클라이언트 구성을 제공
    - 쿼리 클라이언트를 값으로 사용
- useQuery hook 사용하여 서버에서 데이터 가져오기

## 리액트 쿼리 적용하기

### setup

- query client를 생성한다. (쿼리와 캐시 그리고 캐시를 조작하는 도구가 포함되어 있음)
    - 이 도구를 직접 사용하진 않음.
    - 대신 쿼리 클라이언트를 prop으로 쓰는 QueryClientProvider를 추가
- QueryClientProvider
    - QueryClientProvider로 감싸면 자식 컴포넌트가 tanstack-query 훅을 사용할 수 있음
    - 프로바이더 내부에서 쿼리 클라이언트를 사용할 수 있다

```jsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// 쿼리 클라이언트를 위한 옵션을 넣어 쿼리클라이언트 클래스를 생성함
const queryClient = new QueryClient();

function App() {
  return (
    // QueryClientProvider의 모든 자식컴포넌트는 queryClient에 접근 가능
    <QueryClientProvider client={queryClient}>
      <div className="App">
	      <h1>Blog &apos;em Ipsum</h1>
	      <Posts />
      </div>
     </QueryClientProvider>
  );
}
```

### useQuery 사용

useQuery훅에 인자로 어떤 데이터를 가져올지를 알려주기 위한 **옵션 객체**를 전달함.

- **queryKey**: 쿼리 캐시 내의 데이터를 정의
    - (react-query v4 이상에서는 항상 배열)
- **queryFn**: 데이터를 가져오기 위해 실행할 함수

```jsx
import { useQuery } from "@tanstack/react-query";

export function Posts() {
  const { data, isError, isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  });
  
  if (isLoading) { return <h3>loading...</h3> }
  
  return (
    <>
      <ul>
        {data.map((post) => (
          <li key={post.id}>
	          {post.title}
          </li>
      </ul> 
    <>
}
```

useQuer가 반환하는 객체에는 여러개의 속성이 있다.

- data: useQuery에 전달할 쿼리 함수의 반환값. 페칭 결과
- isLoading: 로딩중인지에 대한 여부 boolean
- isError: 에러 발생 여부 boolean
    - 기본적으로 queryFn을 3번(기본설정) 시도한 후 계속 에러 및 실패하면 true가됨.
- isFetching: 비동기 쿼리가 아직 해결되지 않았음
- error: 에러 발생시 에러객체

### isFetching VS isLoading

**isFetching**

- 비동기 쿼리 함수가 아직 해결되지 않았는지의 여부
- true: 데이터를 아직 가져오고 있는 상태

**isLoading**

- isFetching이 참이고, 해당 쿼리에 대한 캐시된 데이터가 없는지의 여부
- true: 데이터를 가져오고 있고 캐시된 데이터도 없는 상태

### stale data란?

- 유효기간이 만료되어 다시 가져올 준비가 된 데이터
    - **staleTime** - 캐시된 데이터가 만료되는 시간
- 데이터는 여전히 캐시에 있음(데이터가 stale로 표시되었다고 해도 캐시에서 삭제되었다는 것은 아님)
    - 그저 데이터를 다시 검증해야한다는 뜻
- stale data에 대해서만 refetch 함
    - ex) 쿼리를 포함하는 컴포넌트가 다시 마운트되거나, 브라우저창이 refocus 될 때 ⇒ refetch
        - 데이터가 fresh상태일 때 refetch가 트리거된다면 데이터를 다시 가져오지 않음.(stale이 아니고 fresh상태이기 때문)
    - stale 시간 = 데이터의 최대 수명(데이터가 오래됐을 가능성을 얼마나 용인할 것인가?)
    - 기본적으로는 0ms임.
        - 화면의 데이터가 항상 최신인지를 물어야 함.
        - 늘 데이터가 stale이라 가정. 서버에서 다시 가져와야 함.
        - 클라이언트에 stale 데이터가 있을 가능성을 줄이는 것.
    

### gcTime

재사용할 데이터를 캐시에 유지할 시간을 결정.

- 데이터와 연관된 활성된 useQuery가 없고, 데이터가 현재 페이지에 표시되지 않으면 “cold storage”상태로 들어가는데, 쿼리가 캐시에 있으나 사용되진 않고 유효기간이 정해져있는 것
- gcTime이 지나면 캐시에서 데이터가 사라짐.
- 기본 gcTime은 5분
- 데이터가 페이지에 표시된 후부터 시간 측정(데이터가 페이지에 표시될 때는 시간 측정이 진행되지 않음. 데이터가 React 앱에서 사용되지 않으면 진행 됨)

좀 지난 데이터일 수 있지만 서버에서 fresh 데이터를 가져오는 동안 표시하는 건 괜찮은…

1. fresh 상태 + cache에 데이터 있음  
        - refetch 안함. 캐시데이터 사용

2. stale 상태 + cache에 데이터 있음
        - refetch하면서 그동안 캐시데이터 보여줌

3. cache에 데이터 없음
        - refetch하면서 보여줄 데이터 없음


### Query key

```jsx
const { data, isLoading, isError, error } = useQuery({ 
	queryKey: ["comments", post.id], 
	queryFn: () => fetchComments(post.id) 
});
```

- 같은 쿼리키로 데이터를 새로 가져오기 위해서는 트리거가 필요함.
    - 예를들면 컴포넌트를 다시 마운트 하거나, 창에 다시 포커스하거나, refetch함수를 수동으로 실행하거나, 등등
- 동일한 쿼리 키로 쿼리 함수가 실행되면 캐시된 데이터가 있는 경우 새로운 데이터를 가져오지 않고 캐시된 데이터를 사용함.
- 쿼리 키가 변경되어야 새로운 쿼리가 생성됨. 따라서 각각의 쿼리에 대해 별도로 라벨을 지정하여 각 쿼리를 개별적으로 캐시할 수 있음. (각 쿼리는 개별적인 **`stale`** 시간과 캐시 시간을 갖게 됨)
- **데이터를 가져올 때 사용되는 쿼리 함수의 모든 값은 쿼리 키의 일부여야 하며, 종속성 배열에 요소로 넣어주어야 함. ⇒ 쿼리 함수를 변경하는 모든 값이 쿼리 키에 포함되어야 데이터가 변경될 것으로 예상할 때 재실행이 됨**

## Prefetching

- 사용자가 요청하기 전에 필요한 데이터를 미리 불러오는 것.
- 데이터를 캐싱
- 기본적으로 stale로 간주하지만 re-fetching을 하는 동안 캐시에 있는 데이터를 제공해줄 수 있음
- ex) 페이지네이션의 다음페이지에 대한 prefetching, 사용자 웹사이트 방문시 다음 방문할 탭의 데이터 prefetching

### **prefetchQuery**

미리 데이터를 불러와서 캐싱하는 queryClient의 메소드

```jsx
// prefetchQuery메소드를 사용해서 다음 페이지 데이터 prefetching 하기

// 컴포넌트 내부
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (currentPage < maxPostPage) {
      const nextPage = currentPage + 1;
      queryClient.prefetchQuery({ queryKey: ["posts", nextPage], queryFn: () => fetchPosts(nextPage) })
    }
  },[currentPage, queryClient])
```

- 쿼리 클라이언트를 가져와서 prefetchQuery메소드 사용
- prefetching할 시점을 신중히 생각해서 prefetchQuery 실행시키기.
- prefetchQuery의 인수는 useQuery와 유사함.
    - queryKey의 형태 일치해야 함
- 예를들어 다음 페이지에 대한 prefetching이라면..
    - 다음 페이지 버튼의 클릭 이벤트에서 실행하는것? X → 상태 업데이트가 비동기적으로 일어나기 때문에 현재 페이지가 무엇인지 확실히 할 수 없음.
    - 현재 페이지가 변경될 때마다 실행되어야 하므로 useEffect를 사용

## Mutations

네트워크 호출을 해서 서버에서 실제 데이터를 업데이트하는 것

```jsx
// 컴포넌트 내부
const updateMutation = useMutation({
    mutationFn: (postId) => updatePost(postId),
})

return <div>
         <button onClick={() => updateMutation.mutate(post.id)}>Update title</button>
         {updateMutation.isPending && <p className='loading'>Updating the post</p>}
         {updateMutation.isError && <p className='error'>Error updating the post: {updateMutation.error.toString()}</p>}
         {updateMutation.isSuccess && <p className='success'>Post was (not) update</p>}
	     </div>
```

- useMutation의 인자로 전달할 객체의 mutationFn 속성에 서버의 변경사항을 호출하는 함수를 작성
    - useMutation이 리턴하는 mutation객체의 `mutate` 메서드를 호출하면 됨
- isPending 속성으로 mutation 진행 여부를 표시

### useIsFetching

현재 백그라운드에서 실행 중인 쿼리 요청의 수를 추적하는 데 사용.
(애플리케이션에서 백그라운드에서 실행 중인 쿼리가 있는지 여부를 확인할 수 있음)

- 현재 가져오기 상태인 쿼리 호출의 수를 나타내는 정수를 반환.
    - 그 결과에 따라 UI를 업데이트할 수 있음
- 로딩 인디케티터에 사용