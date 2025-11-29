import { useState } from 'react'
import Login from './Components/Login.jsx'
import Signup from './Components/Signup.jsx'
import './App.css'

import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'

function App() {
  const [user, setUser] = useState(null)
  const [isLogin, setIsLogin] = useState(true)
  const [view, setView] = useState('dashboard')

  if (!user) {
    return (<>

      <h1>PGA Player Performance Analyzer</h1>
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
