import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

function HabitDetail({
  selectedHabit,
  setTab,
  setEditingHabit
}) {

  const [watcher, setWatcher] =
    useState(null)

  const [completed, setCompleted] =
    useState(false)

  useEffect(() => {

    async function init() {

      if (!selectedHabit)
        return

      const {
        data: { user }
      } =
        await supabase.auth.getUser()

      const now =
        new Date()

      const today =
        now
          .toISOString()
          .split('T')[0]

      const yesterday =
        new Date(
          now.getTime() -
          86400000
        )
          .toISOString()
          .split('T')[0]

      const {
        data: todayLog
      } =
        await supabase
          .from('habit_logs')
          .select('*')
          .eq(
            'habit_id',
            selectedHabit.id
          )
          .eq(
            'user_id',
            user.id
          )
          .eq(
            'log_date',
            today
          )
          .maybeSingle()

      setCompleted(
        !!todayLog
      )

      const {
        data: yesterdayLog
      } =
        await supabase
          .from('habit_logs')
          .select('*')
          .eq(
            'habit_id',
            selectedHabit.id
          )
          .eq(
            'user_id',
            user.id
          )
          .eq(
            'log_date',
            yesterday
          )
          .maybeSingle()

      if (
        !yesterdayLog &&
        selectedHabit
          .watcher_id
      ) {

        const month =
          yesterday.slice(
            0,
            7
          )

        if (
          selectedHabit
            .due_month !==
          month
        ) {

          await supabase
            .from(
              'habits'
            )
            .update({
              monthly_due:
                selectedHabit
                  .owe_amount ||
                0,
              due_month:
                month
            })
            .eq(
              'id',
              selectedHabit.id
            )

        } else {

          await supabase
            .from(
              'habits'
            )
            .update({
              monthly_due:
                (
                  selectedHabit
                    .monthly_due ||
                  0
                ) +
                (
                  selectedHabit
                    .owe_amount ||
                  0
                )
            })
            .eq(
              'id',
              selectedHabit.id
            )
        }
      }

      if (
        !selectedHabit
          .watcher_id
      ) {
        setWatcher(
          null
        )
        return
      }

      const {
        data
      } =
        await supabase
          .from('profiles')
          .select('*')
          .eq(
            'id',
            selectedHabit.watcher_id
          )
          .single()

      setWatcher(
        data
      )
    }

    init()

  }, [selectedHabit])

  async function markDone() {

    const {
      data: { user }
    } =
      await supabase.auth.getUser()

    const now =
      new Date()

    const today =
      now
        .toISOString()
        .split('T')[0]

    const {
      error
    } =
      await supabase
        .from(
          'habit_logs'
        )
        .insert([
          {
            habit_id:
              selectedHabit.id,
            user_id:
              user.id,
            completed_date:
              today,
            log_date:
              today,
            completed_at:
              now.toISOString(),
            penalty_added:
              false
          }
        ])

    if (error) {
      console.log(
        error
      )
      alert(
        'Already completed'
      )
      return
    }

    setCompleted(
      true
    )
  }

  async function deleteHabit() {

    const confirmed =
      window.confirm(
        'Delete this habit?'
      )

    if (!confirmed)
      return

    const {
      error
    } =
      await supabase
        .from('habits')
        .delete()
        .eq(
          'id',
          selectedHabit.id
        )

    if (error) {
      console.log(
        error
      )
      alert(
        'Delete failed'
      )
      return
    }

    alert(
      'Habit deleted'
    )

    setTab(
      'Home'
    )
  }

  if (!selectedHabit) {
    return (
      <div className="p-4">
        No habit selected
      </div>
    )
  }

  return (
    <div className="p-4 pb-24">

      <button
        onClick={() =>
          setTab(
            'Home'
          )
        }
        className="mb-4 text-slate-400"
      >
        ← Back
      </button>

      <div className="bg-slate-900 rounded-3xl p-5">

        <h2 className="text-2xl font-bold">
          {
            selectedHabit
              .habit_name
          }
        </h2>

        <p className="text-slate-400 mt-2">
          {
            selectedHabit
              .frequency
          }
        </p>

        <div className="mt-5 space-y-3">

          <p>
            Start:
            {' '}
            {
              selectedHabit
                .start_date
            }
          </p>

          <p>
            End:
            {' '}
            {
              selectedHabit
                .end_date
            }
          </p>

          <p>
            Owe:
            ₹
            {
              selectedHabit
                .owe_amount ||
              0
            }
          </p>

          <p>
            Month Due:
            ₹
            {
              selectedHabit
                .monthly_due ||
              0
            }
          </p>

          <p>
            Watcher:
            {' '}
            {
              watcher
                ?.full_name ||
              'None'
            }
          </p>

        </div>

        {completed ? (

          <button
            disabled
            className="w-full mt-6 bg-green-600 rounded-3xl py-4 font-semibold opacity-80"
          >
            Completed ✅
          </button>

        ) : (

          <button
            onClick={
              markDone
            }
            className="w-full mt-6 bg-white text-black rounded-3xl py-4 font-semibold"
          >
            Complete Habit
          </button>

        )}

        <button
          onClick={() => {
            setEditingHabit(
              selectedHabit
            )
            setTab(
              'CreateHabit'
            )
          }}
          className="w-full mt-3 bg-slate-800 rounded-3xl py-4 font-semibold"
        >
          Edit Habit
        </button>

        <button
          onClick={
            deleteHabit
          }
          className="w-full mt-3 bg-red-600 rounded-3xl py-4 font-semibold"
        >
          Delete Habit
        </button>

      </div>

    </div>
  )
}

export default HabitDetail