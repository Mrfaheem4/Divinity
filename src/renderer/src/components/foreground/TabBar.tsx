import { useEffect, useState } from 'react'

function TabBar() {
  const [tabs, setTabs] = useState<{ id: string; url: string; isHome: boolean }[]>([])

  useEffect(() => {
    window.api.getTabs().then((fetchedTabs) => {
      setTabs(fetchedTabs)
    })
  }, [])

  return (
    <>
      <div className="h-10 w-full bg-gray-50 flex items-center justify-start gap-2 px-2">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => {
              console.log('clicked', tab.id)
              window.api.switchTab(tab.id)
            }}
          >
            <span>{tab.isHome ? 'Home' : tab.url}</span>
          </div>
        ))}
      </div>
    </>
  )
}

export default TabBar
