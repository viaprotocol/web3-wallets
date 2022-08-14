import { useEffect, useState } from 'react'

function useTabActive() {
  const [isActive, setIsActive] = useState(document.hasFocus())
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsActive(document.visibilityState === 'visible')
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  return isActive
}

export { useTabActive }
