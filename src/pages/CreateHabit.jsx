import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function CreateHabit({
  setTab,
  editingHabit,
  setEditingHabit
}) {

  const [habitName, setHabitName] =
    useState('')

  const [startDate, setStartDate] =
    useState('')

  const [endDate, setEndDate] =
    useState('')

  const [frequency, setFrequency] =
    useState('Daily')

  const [friends, setFriends] =
    useState([])

  const [watcherId, setWatcherId] =
    useState('')

  const [oweAmount, setOweAmount] =
    useState('')

  async function loadFriends() {

    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) return

    const { data, error } =
      await supabase
        .from('friends')
        .select(`
          *,
          sender:sender_id(
            id,
            full_name
          ),
          receiver:receiver_id(
            id,
            full_name
          )
        `)
        .or(
          `sender_id.eq.${user.id},receiver_id.eq.${user.id}`
        )
        .eq(
          'status',
          'accepted'
        )

    if (error) {
      console.log(error)
      return
    }

    const mapped =
      (data || []).map((f) => {

        if (
          f.sender_id === user.id
        ) {
          return f.receiver
        }

        return f.sender
      })

    setFriends(mapped)
  }

  useEffect(() => {

    async function init() {
      await loadFriends()
    }

    init()

  }, [])

  useEffect(() => {

    if (!editingHabit) {
      return
    }

    queueMicrotask(() => {

      setHabitName(
        editingHabit.habit_name || ''
      )

      setStartDate(
        editingHabit.start_date || ''
      )

      setEndDate(
        editingHabit.end_date || ''
      )

      setFrequency(
        editingHabit.frequency || 'Daily'
      )

      setWatcherId(
        editingHabit.watcher_id || ''
      )

      setOweAmount(
        editingHabit.owe_amount || ''
      )

    })

  }, [editingHabit])

  async function saveHabit() {

    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      alert('Login required')
      return
    }

    let error

    if (editingHabit) {

      const result =
        await supabase
          .from('habits')
          .update({
            habit_name:
              habitName,
            start_date:
              startDate,
            end_date:
              endDate,
            frequency,
            watcher_id:
              watcherId || null,
            owe_amount:
              oweAmount || 0
          })
          .eq(
            'id',
            editingHabit.id
          )

      error =
        result.error

    } else {

      const result =
        await supabase
          .from('habits')
          .insert([
            {
              user_id:
                user.id,
              habit_name:
                habitName,
              start_date:
                startDate,
              end_date:
                endDate,
              frequency,
              watcher_id:
                watcherId || null,
              owe_amount:
                oweAmount || 0
            }
          ])

      error =
        result.error
    }

    if (error) {
      console.log(error)
      alert(
        'Error saving habit'
      )
      return
    }

    alert('Habit saved')

    setEditingHabit(null)

    setHabitName('')
    setStartDate('')
    setEndDate('')
    setFrequency('Daily')
    setWatcherId('')
    setOweAmount('')

    setTab('Home')
  }

  return (
    <div className="p-4 pb-24">

      <h2 className="text-2xl font-bold mb-5">
        {
          editingHabit
            ? 'Edit Habit'
            : 'Create Habit'
        }
      </h2>

      <div className="bg-slate-900 rounded-3xl p-5 space-y-4">

        <input
          value={habitName}
          onChange={(e) =>
            setHabitName(
              e.target.value
            )
          }
          placeholder="Habit name"
          className="w-full bg-slate-800 rounded-2xl p-4 outline-none"
        />

        <input
          type="date"
          value={startDate}
          onChange={(e) =>
            setStartDate(
              e.target.value
            )
          }
          className="w-full bg-slate-800 rounded-2xl p-4 outline-none"
        />

        <input
          type="date"
          value={endDate}
          onChange={(e) =>
            setEndDate(
              e.target.value
            )
          }
          className="w-full bg-slate-800 rounded-2xl p-4 outline-none"
        />

        <select
          value={frequency}
          onChange={(e) =>
            setFrequency(
              e.target.value
            )
          }
          className="w-full bg-slate-800 rounded-2xl p-4 outline-none"
        >
          <option value="Daily">
            Daily
          </option>

          <option value="Weekly">
            Weekly
          </option>
        </select>

        <select
          value={watcherId}
          onChange={(e) =>
            setWatcherId(
              e.target.value
            )
          }
          className="w-full bg-slate-800 rounded-2xl p-4 outline-none"
        >
          <option value="">
            No Watcher
          </option>

          {friends.map(
            (friend) => (
              <option
                key={friend.id}
                value={friend.id}
              >
                {
                  friend.full_name
                }
              </option>
            )
          )}
        </select>

        <input
          type="number"
          value={oweAmount}
          onChange={(e) =>
            setOweAmount(
              e.target.value
            )
          }
          placeholder="Owe amount ₹"
          className="w-full bg-slate-800 rounded-2xl p-4 outline-none"
        />

        <button
          onClick={saveHabit}
          className="w-full bg-white text-black rounded-3xl py-4 font-semibold"
        >
          {
            editingHabit
              ? 'Update Habit'
              : 'Save Habit'
          }
        </button>

      </div>

    </div>
  )
}

export default CreateHabit