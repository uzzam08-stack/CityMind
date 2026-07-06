import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Alerts from './pages/Alerts'
import RoutesPage from './pages/Routes'
import Query from './pages/Query'
import Analytics from './pages/Analytics'
import Benchmark from './pages/Benchmark'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="flex min-h-screen bg-[#0B1120]">
          <Sidebar />
          <main className="flex-1 ml-64 p-6 lg:p-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/routes" element={<RoutesPage />} />
              <Route path="/query" element={<Query />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/benchmark" element={<Benchmark />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
