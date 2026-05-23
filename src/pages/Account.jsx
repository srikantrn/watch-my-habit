import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

function Account() {

  const [user, setUser] = useState(null)
  const [profile, setProfile] =
    useState(null)

  useEffect(() => {

    const loadProfile =
      async () => {

        const {
          data: { user }
        } =
          await supabase.auth.getUser()

        setUser(user)

        if (!user) return

        const { data } =
          await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle()

        setProfile(data)
      }

    loadProfile()

  }, [])

  async function logout() {
    await supabase.auth.signOut()
  }

  return (
    <div className="p-4">

      <h2 className="text-2xl font-bold mb-6">
        Account
      </h2>

      <div className="bg-slate-900 rounded-3xl p-5">

        <div className="flex items-center gap-4">

          <img
            src={
              profile?.avatar_url
            }
            alt="profile"
            className="w-16 h-16 rounded-full object-cover bg-slate-800"
          />

          <div>

            <h3 className="font-semibold text-lg">
              {profile?.full_name}
            </h3>

            <p className="text-slate-400 text-sm">
              {user?.email}
            </p>

          </div>

        </div>

        <div className="mt-6">

          <p className="text-slate-400 text-sm">
            Unique ID
          </p>

          <p className="mt-1 font-semibold">
            {profile?.unique_id}
          </p>

        </div>

        <button
          onClick={logout}
          className="w-full mt-6 bg-red-500 rounded-2xl py-3 font-semibold"
        >
          Logout
        </button>

      </div>

    </div>
  )
}

export default Account