import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

function Home({
  setTab,
  setSelectedHabit
}) {

  const [user, setUser] =
    useState(null)

  const [habits, setHabits] =
    useState([])

  useEffect(() => {

    async function init() {

      const {
        data: { user }
      } =
        await supabase.auth.getUser()

      setUser(user)

      if (!user) return

      const {
        data,
        error
      } = await supabase
        .from('habits')
        .select(`
          *,
          watcher:watcher_id(
            full_name
          )
        `)
        .eq(
          'user_id',
          user.id
        )
        .order(
          'created_at',
          { ascending: false }
        )

      if (error) {
        console.log(error)
        return
      }

      setHabits(data || [])
    }

    init()

  }, [])

  return (
    <div className="p-4 pb-24">

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-2xl font-bold">
            Hi,
            {' '}
            {
              user
                ?.user_metadata
                ?.full_name ||
              'User'
            }
          </h1>

          <p className="text-slate-400 mt-1">
            Consistency Loading...
          </p>

        </div>

      </div>

      <button
        onClick={() =>
          setTab('CreateHabit')
        }
        className="w-full mt-5 bg-white text-black rounded-3xl py-4 font-semibold"
      >
        + Create Habit
      </button>

      <div className="mt-6">

        <h2 className="font-semibold text-lg mb-3">
          My Habits
        </h2>

        <div className="space-y-3">

          {habits.length === 0 ? (

            <div className="bg-slate-900 rounded-3xl p-5">

              <p className="text-slate-400">
                No habits yet
              </p>

            </div>

          ) : (

            habits.map(
              (habit) => (

                <div
                  key={habit.id}
                  onClick={() => {
                    setSelectedHabit(
                      habit
                    )
                    setTab(
                      'HabitDetail'
                    )
                  }}
                  className="bg-slate-900 rounded-3xl p-5 cursor-pointer"
                >

                  <h3 className="font-semibold text-lg">
                    {habit.habit_name}
                  </h3>

                  <p className="text-slate-400 text-sm mt-1">
                    {
                      habit.frequency
                    }
                  </p>

                  <p className="text-slate-500 text-sm mt-2">
                    Watcher:
                    {' '}
                    {
                      habit.watcher
                        ?.full_name ||
                      'None'
                    }
                  </p>

                  <p className="text-slate-500 text-sm">
                    ₹
                    {
                      habit.owe_amount ||
                      0
                    }
                  </p>

                </div>

              )
            )

          )}

        </div>

      </div>

    </div>
  )
}

export default Home