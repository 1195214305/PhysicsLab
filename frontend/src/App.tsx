import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './store/theme'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ExperimentPage from './pages/ExperimentPage'
import CategoryPage from './pages/CategoryPage'

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="category/:categoryId" element={<CategoryPage />} />
            <Route path="experiment/:experimentId" element={<ExperimentPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
