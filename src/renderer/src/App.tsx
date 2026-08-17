import Tab from './components/Tab'

function App() {
  return (
    <div className="h-screen w-screen bg-[#0a0d16] relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[65%] h-[65%] bg-[#7683a8] rounded-full blur-[140px] opacity-50 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[35%] h-[35%] bg-[#7C5CFF] rounded-full blur-[100px] opacity-30 pointer-events-none" />
      <Tab />
    </div>
  )
}

export default App
