import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './routes'
import { ToastProvider } from '@/components/ui/use-toast'

function App() {
  return (
    <ToastProvider value={{ toast: (options) => alert(options.title) }}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ToastProvider>
  )
}

export default App
