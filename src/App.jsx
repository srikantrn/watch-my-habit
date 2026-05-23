import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

import Login from './auth/Login'
import BottomNav from './components/BottomNav'

import Home from './pages/Home'
import Today from './pages/Today'
import Friends from './pages/Friends'
import Account from './pages/Account'
import CreateHabit from './pages/CreateHabit'
import HabitDetail from './pages/HabitDetail'
import FriendDetail from './pages/FriendDetail'

function App() {

  const [session, setSession] =
    useState(null)

  const [tab, setTab] =
    useState('Home')

  const [selectedHabit, setSelectedHabit] =
    useState(null)

  const [editingHabit, setEditingHabit] =
    useState(null)

  const [selectedFriend, setSelectedFriend] =
    useState(null)

  useEffect(() => {

    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session)
      })

    const {
      data: listener
    } =
      supabase.auth.onAuthStateChange(
        (_event, session) => {
          setSession(session)
        }
      )

    return () => {
      listener
        .subscription
        .unsubscribe()
    }

  }, [])

  if (!session) {
    return <Login />
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {tab === 'Home' && (
        <Home
          setTab={setTab}
          setSelectedHabit={
            setSelectedHabit
          }
        />
      )}

      {tab === 'Today' && (
        <Today
          setTab={setTab}
          setSelectedHabit={
            setSelectedHabit
          }
        />
      )}

      {tab === 'Friends' && (
        <Friends
          setTab={setTab}
          setSelectedFriend={
            setSelectedFriend
          }
        />
      )}

      {tab === 'FriendDetail' && (
        <FriendDetail
          selectedFriend={
            selectedFriend
          }
          setTab={setTab}
          setSelectedHabit={
            setSelectedHabit
          }
        />
      )}

      {tab === 'Account' && (
        <Account
          setTab={setTab}
        />
      )}

      {tab === 'CreateHabit' && (
        <CreateHabit
          setTab={setTab}
          editingHabit={
            editingHabit
          }
          setEditingHabit={
            setEditingHabit
          }
        />
      )}

      {tab === 'HabitDetail' && (
        <HabitDetail
          selectedHabit={
            selectedHabit
          }
          setTab={setTab}
          setEditingHabit={
            setEditingHabit
          }
        />
      )}

      <BottomNav
        tab={tab}
        setTab={setTab}
      />

    </div>
  )
}

export default App