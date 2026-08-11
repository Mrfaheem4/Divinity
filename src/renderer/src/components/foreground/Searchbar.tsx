function Searchbar() {
  return (
    <div className="border-2 border-white w-[20rem] h-[3rem] rounded-full">
      <input
        placeholder="Search..."
        id="search-input"
        className="relative z-10 w-full h-full rounded-full border-none bg-transparent
         px-4 text-sm text-white outline-none"
      />
    </div>
  )
}

export default Searchbar
