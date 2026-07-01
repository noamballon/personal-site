import {useCallback, useEffect, useState} from 'react'
import {Stack, Text, TextInput} from '@sanity/ui'
import {useClient} from 'sanity'

const API_VERSION = '2024-01-01'

export function MediaDetailsWithDate(props: any) {
  const {currentAsset, renderDefaultDetails} = props
  const client = useClient({apiVersion: API_VERSION})
  const [date, setDate] = useState(currentAsset?.date ?? '')

  useEffect(() => {
    setDate(currentAsset?.date ?? '')
  }, [currentAsset?._id, currentAsset?.date])

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.currentTarget.value
      setDate(value)
      if (!currentAsset?._id) return
      const patch = client.patch(currentAsset._id)
      ;(value ? patch.set({date: value}) : patch.unset(['date'])).commit({autoGenerateArrayKeys: false})
    },
    [client, currentAsset?._id]
  )

  return (
    <Stack space={4}>
      {renderDefaultDetails(props)}
      <Stack space={2}>
        <Text size={1} weight="medium">
          Date
        </Text>
        <TextInput type="date" value={date} onChange={handleChange} />
      </Stack>
    </Stack>
  )
}
