import {
  QueryClient,
  QueryClientProvider
} from '@tanstack/react-query'
import ArkTable from "./components/ArkTable";

const queryClient = new QueryClient();

function App() {
  
  return (
    <QueryClientProvider client={queryClient}>
      <ArkTable />
    </QueryClientProvider>
  );
}

export default App;
