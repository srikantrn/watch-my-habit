import { supabase } from '../lib/supabase'

function Login() {

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-sm bg-slate-900 rounded-3xl p-6 shadow-xl">

        <h1 className="text-3xl font-bold">
          Watch My Habit
        </h1>

        <p className="text-slate-400 mt-2">
          Do it. Prove it. Or owe it.
        </p>

        <button
          onClick={signInWithGoogle}
          className="w-full mt-6 bg-white text-black rounded-2xl py-3 font-semibold"
        >
          Continue with Google
        </button>

      </div>
    </div>
  )
}

export default Login