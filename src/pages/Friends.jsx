import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

function Friends({
  setTab,
  setSelectedFriend
}) {

  const [friends, setFriends] =
    useState([])

  const [requests, setRequests] =
    useState([])

  const [searchId, setSearchId] =
    useState('')

  const [searchResult, setSearchResult] =
    useState(null)

  useEffect(() => {
    loadFriends()
    loadRequests()
  }, [])

  async function loadFriends() {

    const {
      data: { user }
    } =
      await supabase.auth.getUser()

    if (!user) return

    const {
      data,
      error
    } = await supabase
      .from('friends')
      .select(`
        *,
        sender:sender_id(
          id,
          full_name,
          unique_id
        ),
        receiver:receiver_id(
          id,
          full_name,
          unique_id
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
      await Promise.all(
        (data || []).map(
          async (f) => {

            const friend =
              f.sender_id === user.id
                ? f.receiver
                : f.sender

            const {
              data:
                oweMeHabits
            } = await supabase
              .from('habits')
              .select('monthly_due')
              .eq(
                'user_id',
                friend.id
              )
              .eq(
                'watcher_id',
                user.id
              )

            const {
              data:
                iOweHabits
            } = await supabase
              .from('habits')
              .select('monthly_due')
              .eq(
                'user_id',
                user.id
              )
              .eq(
                'watcher_id',
                friend.id
              )

            const theyOweMe =
              (
                oweMeHabits ||
                []
              ).reduce(
                (s, h) =>
                  s +
                  (
                    Number(
                      h.monthly_due
                    ) || 0
                  ),
                0
              )

            const iOweThem =
              (
                iOweHabits ||
                []
              ).reduce(
                (s, h) =>
                  s +
                  (
                    Number(
                      h.monthly_due
                    ) || 0
                  ),
                0
              )

            return {
              ...friend,
              theyOweMe,
              iOweThem
            }
          }
        )
      )

    setFriends(mapped)
  }

  async function loadRequests() {

    const {
      data: { user }
    } =
      await supabase.auth.getUser()

    if (!user) return

    const {
      data,
      error
    } = await supabase
      .from('friends')
      .select(`
        *,
        sender:sender_id(
          id,
          full_name,
          unique_id
        )
      `)
      .eq(
        'receiver_id',
        user.id
      )
      .eq(
        'status',
        'pending'
      )

    if (error) {
      console.log(error)
      return
    }

    setRequests(data || [])
  }

  async function searchFriend() {

    const {
      data,
      error
    } = await supabase
      .from('profiles')
      .select('*')
      .eq(
        'unique_id',
        searchId.toUpperCase()
      )
      .single()

    if (error) {
      alert('User not found')
      return
    }

    setSearchResult(data)
  }

  async function sendRequest() {

    const {
      data: { user }
    } =
      await supabase.auth.getUser()

    if (
      searchResult.id ===
      user.id
    ) {
      alert(
        'Cannot add yourself'
      )
      return
    }

    const {
      data: existing
    } =
      await supabase
        .from('friends')
        .select('*')

    const alreadyExists =
      existing?.some(
        (f) => {

          const pair1 =
            f.sender_id ===
              user.id &&
            f.receiver_id ===
              searchResult.id

          const pair2 =
            f.sender_id ===
              searchResult.id &&
            f.receiver_id ===
              user.id

          return (
            pair1 || pair2
          )
        }
      )

    if (alreadyExists) {
      alert(
        'Request already exists'
      )
      return
    }

    const {
      error
    } =
      await supabase
        .from('friends')
        .insert([
          {
            sender_id:
              user.id,
            receiver_id:
              searchResult.id,
            status:
              'pending'
          }
        ])

    if (error) {
      console.log(error)
      alert(
        'Failed to send request'
      )
      return
    }

    alert(
      'Request sent'
    )

    setSearchResult(null)
    setSearchId('')
  }

  async function updateRequest(
    id,
    status
  ) {

    await supabase
      .from('friends')
      .update({
        status
      })
      .eq(
        'id',
        id
      )

    loadRequests()
    loadFriends()
  }

  return (
    <div className="p-4 pb-24">

      <h2 className="text-2xl font-bold">
        Friends
      </h2>

      <div className="bg-slate-900 rounded-3xl p-4 mt-5 space-y-3">

        <input
          value={searchId}
          onChange={(e) =>
            setSearchId(
              e.target.value
            )
          }
          placeholder="Search Unique ID"
          className="w-full bg-slate-800 rounded-2xl p-4 outline-none"
        />

        <button
          onClick={searchFriend}
          className="w-full bg-white text-black rounded-2xl py-3 font-semibold"
        >
          Search
        </button>

        {searchResult && (
          <div className="bg-slate-800 rounded-2xl p-4">

            <p>
              {
                searchResult.full_name
              }
            </p>

            <p className="text-slate-400 text-sm">
              {
                searchResult.unique_id
              }
            </p>

            <button
              onClick={
                sendRequest
              }
              className="mt-3 bg-white text-black rounded-2xl px-4 py-2"
            >
              Send Request
            </button>

          </div>
        )}

      </div>

      {requests.length > 0 && (
        <div className="mt-6">

          <h3 className="font-semibold mb-3">
            Requests
          </h3>

          <div className="space-y-3">

            {requests.map(
              (r) => (
                <div
                  key={r.id}
                  className="bg-slate-900 rounded-3xl p-4"
                >
                  <p>
                    {
                      r.sender
                        ?.full_name
                    }
                  </p>

                  <div className="flex gap-2 mt-3">

                    <button
                      onClick={() =>
                        updateRequest(
                          r.id,
                          'accepted'
                        )
                      }
                      className="bg-green-500 rounded-xl px-3 py-2"
                    >
                      Accept
                    </button>

                    <button
                      onClick={() =>
                        updateRequest(
                          r.id,
                          'rejected'
                        )
                      }
                      className="bg-red-500 rounded-xl px-3 py-2"
                    >
                      Reject
                    </button>

                  </div>
                </div>
              )
            )}

          </div>

        </div>
      )}

      <div className="space-y-3 mt-6">

        {friends.map(
          (friend) => (

            <div
              key={friend.id}
              onClick={() => {
                setSelectedFriend(
                  friend
                )
                setTab(
                  'FriendDetail'
                )
              }}
              className="bg-slate-900 rounded-3xl p-5 cursor-pointer"
            >

              <h3 className="font-semibold text-lg">
                {
                  friend.full_name
                }
              </h3>

              <p className="text-slate-400 text-sm">
                ID:
                {' '}
                {
                  friend.unique_id
                }
              </p>

              <div className="mt-3 text-sm">

                <p className="text-green-400">
                  They owe me ₹
                  {
                    friend.theyOweMe
                  }
                </p>

                <p className="text-red-400">
                  I owe them ₹
                  {
                    friend.iOweThem
                  }
                </p>

              </div>

            </div>

          )
        )}

      </div>

    </div>
  )
}

export default Friends