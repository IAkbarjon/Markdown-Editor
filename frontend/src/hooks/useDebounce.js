import { useState, useEffect } from 'react'

function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    // Устанавливаем таймер
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Очищаем таймер при каждом новом изменении value
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

export default useDebounce
