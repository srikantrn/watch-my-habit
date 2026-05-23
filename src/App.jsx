import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Login from './auth/Login'

function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (!session) {
    return <Login />
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      <div className="bg-slate-900 p-6 rounded-3xl">
        <h1 className="text-2xl font-bold">
          Logged In
        </h1>

        <p className="mt-2 text-slate-400">
          {session.user.email}
        </p>
      </div>
    </div>
  )
}

export default App