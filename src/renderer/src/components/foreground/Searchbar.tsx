import SpotlightCard from '../SpotlightCard'

function Searchbar() {
  return (
    <SpotlightCard
      className="w-[30rem] h-[3rem] !rounded-full !p-0"
      spotlightColor="rgba(255, 255, 255, 0.25)"
    >
      <div className="border-2 border-white/50 w-full h-full rounded-full">
        <input
          placeholder="Search the Web"
          id="search-input"
          className="relative z-10 w-full h-full rounded-full border-none bg-transparent
           px-4 text-sm text-white outline-none"
        />
      </div>
    </SpotlightCard>
  )
}

export default Searchbar
