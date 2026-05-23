import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

function Today({
  setTab,
  setSelectedHabit
}) {

  const [habits, setHabits] = useState([])
  const [completed, setCompleted] = useState([])
  const [user, setUser] = useState(null)

  useEffect(() => {

    const loadTodayData = async () => {

      const {
        data: { user }
      } = await supabase.auth.getUser()

      setUser(user)

      if (!user) return

      const today = new Date()
        .toISOString()
        .split('T')[0]

      const { data: habitsData } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .lte('start_date', today)
        .gte('end_date', today)

      setHabits(habitsData || [])

      const { data: logsData } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed_date', today)

      setCompleted(logsData || [])
    }

    loadTodayData()

  }, [])

  async function markDone(habitId) {

    const today = new Date()
      .toISOString()
      .split('T')[0]

    const { error } = await supabase
      .from('habit_logs')
      .insert([
        {
          habit_id: habitId,
          user_id: user.id,
          completed_date: today
        }
      ])

    if (error) {
      console.log(error)
      alert('Already completed')
      return
    }

    setCompleted([
      ...completed,
      {
        habit_id: habitId,
        completed_date: today
      }
    ])
  }

  function isCompleted(habitId) {
    return completed.some(
      log => log.habit_id === habitId
    )
  }

  const totalHabits = habits.length
  const completedCount = completed.length
  const percent =
    totalHabits === 0
      ? 0
      : Math.round(
          (completedCount / totalHabits) * 100
        )

  return (
    <div className="p-4 pb-24">

      <h2 className="text-2xl font-bold">
        Today
      </h2>

      <div className="bg-slate-900 rounded-3xl p-5 mt-4">

        <h3 className="font-semibold text-lg">
          Today's Progress
        </h3>

        <p className="text-slate-400 mt-2">
          {completedCount} / {totalHabits} completed
        </p>

        <p className="text-2xl font-bold mt-2">
          {percent}%
        </p>

      </div>

      <div className="space-y-3 mt-5">

        {habits.length === 0 ? (

          <div className="bg-slate-900 rounded-3xl p-5">
            <p className="text-slate-400">
              No active habits today
            </p>
          </div>

        ) : (

          habits.map((habit) => (

            <div
  key={habit.id}
  onClick={() => {
    setSelectedHabit(habit)
    setTab('HabitDetail')
  }}
  className="bg-slate-900 rounded-3xl p-5 cursor-pointer"
>

              <h3 className="font-semibold text-lg">
                {habit.habit_name}
              </h3>

              <p className="text-slate-400 text-sm mt-1">
                {habit.frequency}
              </p>

              {isCompleted(habit.id) ? (

                <button
                  disabled
                  className="mt-4 bg-green-600 text-white px-4 py-2 rounded-2xl font-semibold opacity-80"
                >
                  Completed ✅
                </button>

              ) : (

                <button
                  onClick={() => markDone(habit.id)}
                  className="mt-4 bg-white text-black px-4 py-2 rounded-2xl font-semibold"
                >
                  Done
                </button>

              )}

            </div>

          ))

        )}

      </div>

    </div>
  )
}

export default Today