function BottomNav({ tab, setTab }) {

  const tabs = [
    'Home',
    'Today',
    'Friends',
    'Account',
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 flex justify-around py-3">

      {tabs.map((item) => (
        <button
          key={item}
          onClick={() => setTab(item)}
          className={`text-sm ${
            tab === item
              ? 'text-white font-semibold'
              : 'text-slate-500'
          }`}
        >
          {item}
        </button>
      ))}

    </div>
  )
}

export default BottomNav