import { Posts } from "./Posts";
import "./App.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// 쿼리 클라이언트를 위한 옵션을 넣어 쿼리클라이언트 클래스를 생성함
const queryClient = new QueryClient();

function App() {
  return (
    // provide React Query client to App
    <QueryClientProvider client={queryClient}>
    <div className="App">
      <h1>Blog &apos;em Ipsum</h1>
      <Posts />
      </div>
      <ReactQueryDevtools />
      </QueryClientProvider>
  );
}

export default App;
