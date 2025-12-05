import { useState, useEffect } from 'react'
import Login from './Components/Login.jsx'
import Signup from './Components/Signup.jsx'
import './App.css'

import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'

function App() {
  const [user, setUser] = useState(null)
  const [isLogin, setIsLogin] = useState(true)
  const [view, setView] = useState('dashboard')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkUser() {
      try {
        const res = await fetch('http://localhost:3000/auth/me', { credentials: 'include' })
        const data = await res.json()
        if (data.user) {
          setUser(data.user)
        }
      } catch (err) {
        console.error("Failed to fetch user session", err)
      } finally {
        setLoading(false)
      }
    }
    checkUser()
  }, [])

  if (loading) {
    return null // or a spinner
  }

  if (!user) {
    return (<>

      <h1 id='title'>PGA Player Performance Analyzer</h1>

      {isLogin ?
        <Login setUser={setUser} toggleSignup={() => setIsLogin(false)} /> :
        <Signup setUser={setUser} toggleLogin={() => setIsLogin(true)} />
      }


    </>)
  }

  if (view === 'profile') {
    return <Profile user={user} goBack={() => setView('dashboard')} />
  }

  return <Dashboard user={user} goToProfile={() => setView('profile')} />
}

export default App
