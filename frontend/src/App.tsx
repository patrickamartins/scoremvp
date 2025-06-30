import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './routes'
import { Toaster } from 'sonner'

function App() {
  return (
    <>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
      <Toaster 
        position="top-right"
        richColors
        closeButton
        duration={5000}
      />
    </>
  )
}

export default App
