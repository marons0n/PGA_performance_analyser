import { useState } from 'react'
import Login from './Components/Login.jsx'
import Signup from './Components/Signup.jsx'
import './App.css'

// import Dashboard from './pages/Dashboard'

function App() {
  const [user, setUser] = useState(null)
  const [isLogin, setIsLogin] = useState(true)

  if (!user) {
    return (<>

      <h1>PGA Player Performance Analyzer</h1>
      {isLogin ?
        <Login setUser={setUser} toggleSignup={() => setIsLogin(false)} /> :
        <Signup setUser={setUser} toggleLogin={() => setIsLogin(true)} />
      }

    </>)
  }

  // return <Dashboard user={user} />
  return <h1>Hello</h1>
}

export default App
