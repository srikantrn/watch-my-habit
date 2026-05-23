import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

function FriendDetail({
  selectedFriend,
  setTab,
  setSelectedHabit
}) {

  const [tabMode, setTabMode] =
    useState('their')

  const [habits, setHabits] =
    useState([])

  useEffect(() => {

    async function load() {

      const {
        data: { user }
      } =
        await supabase.auth.getUser()

      if (!selectedFriend)
        return

      let query =
        supabase
          .from('habits')
          .select(`
            *,
            watcher:watcher_id(
              full_name
            )
          `)

      if (
        tabMode === 'their'
      ) {

        query =
          query.eq(
            'user_id',
            selectedFriend.id
          )

      } else {

        query =
          query
            .eq(
              'user_id',
              selectedFriend.id
            )
            .eq(
              'watcher_id',
              user.id
            )
      }

      const {
        data,
        error
      } =
        await query

      if (error) {
        console.log(error)
        return
      }

      setHabits(
        data || []
      )
    }

    load()

  }, [
    selectedFriend,
    tabMode
  ])

  async function removeFriend() {

    const confirmed =
      window.confirm(
        'Remove this friend?'
      )

    if (!confirmed)
      return

    const {
      data: { user }
    } =
      await supabase.auth.getUser()

    const {
      data: friendship,
      error: findError
    } =
      await supabase
        .from('friends')
        .select('*')
        .eq(
          'status',
          'accepted'
        )

    if (findError) {
      console.log(findError)
      alert(
        findError.message
      )
      return
    }

    const row =
      friendship?.find(
        (f) => {

          const pair1 =
            f.sender_id ===
              user.id &&
            f.receiver_id ===
              selectedFriend.id

          const pair2 =
            f.sender_id ===
              selectedFriend.id &&
            f.receiver_id ===
              user.id

          return (
            pair1 || pair2
          )
        }
      )

    if (!row) {
      alert(
        'Friendship not found'
      )
      return
    }

    const {
      error
    } =
      await supabase
        .from('friends')
        .delete()
        .eq(
          'id',
          row.id )

    if (error) {
      console.log(error)
      alert(
        error.message
      )
      return
    }

    alert(
      'Friend removed'
    )

    setTab(
      'Friends'
    )
  }

  if (!selectedFriend) {
    return (
      <div className="p-4">
        No friend selected
      </div>
    )
  }

  return (
    <div className="p-4 pb-24">

      <button
        onClick={() =>
          setTab(
            'Friends'
          )
        }
        className="mb-4 text-slate-400"
      >
        ← Back
      </button>

      <div className="bg-slate-900 rounded-3xl p-5">

        <h2 className="text-2xl font-bold">
          {
            selectedFriend
              .full_name
          }
        </h2>

        <p className="text-slate-400 mt-1">
          ID:
          {' '}
          {
            selectedFriend
              .unique_id
          }
        </p>

        <div className="mt-4 space-y-1">

          <p className="text-green-400">
            They owe me ₹
            {
              selectedFriend
                .theyOweMe
            }
          </p>

          <p className="text-red-400">
            I owe them ₹
            {
              selectedFriend
                .iOweThem
            }
          </p>

        </div>

        <button
          onClick={
            removeFriend
          }
          className="w-full mt-5 bg-red-600 rounded-3xl py-3 font-semibold"
        >
          Remove Friend
        </button>

      </div>

      <div className="flex gap-2 mt-5">

        <button
          onClick={() =>
            setTabMode(
              'their'
            )
          }
          className={`flex-1 rounded-2xl py-3 ${
            tabMode === 'their'
              ? 'bg-white text-black'
              : 'bg-slate-900'
          }`}
        >
          Their Habits
        </button>

        <button
          onClick={() =>
            setTabMode(
              'watching'
            )
          }
          className={`flex-1 rounded-2xl py-3 ${
            tabMode ===
            'watching'
              ? 'bg-white text-black'
              : 'bg-slate-900'
          }`}
        >
          I Watch
        </button>

      </div>

      <div className="space-y-3 mt-5">

        {habits.length === 0 ? (

          <div className="bg-slate-900 rounded-3xl p-5">
            <p className="text-slate-400">
              No habits found
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

                <h3 className="font-semibold">
                  {
                    habit.habit_name
                  }
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
  )
}

export default FriendDetail