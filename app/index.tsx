import { useState, useEffect } from 'react'
import { supabase } from '../src/config/supabase'
import Auth from './Auth'
import { View, Text, ActivityIndicator } from 'react-native'
import { Session } from '@supabase/supabase-js'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
    })
  }, [])


  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />
  }

  return (
    <View>
      {session ? (
        <Text>Welcome, {session.user.id}</Text>
      ) : (
        <Auth />
      )}
    </View>
  )
}