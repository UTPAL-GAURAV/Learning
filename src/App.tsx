import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useStore } from './store'
import HomePage from './pages/HomePage'
import SessionPage from './pages/SessionPage'
import '@/lib/theme' // initialise theme on import

export default function App() {
  const load = useStore(s => s.load)
  useEffect(() => { load() }, [load])

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/session/:topicSlug" element={<SessionPage />} />
    </Routes>
  )
}
