import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import { supabase } from '../src/config/supabase';
import { useRouter } from 'expo-router';

const LoginScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async () => {
    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        alert(error.message);
        return;
      }
      if (data.user) {
        const { data: profileData, error: profileError } = await supabase.from('users_profile').insert([{ id: data.user.id, username }]).select()
        if (profileError) {
          console.error(profileError.message)
          return;
        }
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        alert(error.message);
        return;
      }
    }
    router.replace('/');
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput placeholder="Email" onChangeText={setEmail} value={email} />
      <TextInput placeholder="Password" secureTextEntry onChangeText={setPassword} value={password} />
      {isSignUp && <TextInput placeholder="Username" onChangeText={setUsername} value={username} />}
      <Button title={isSignUp ? "Sign Up" : "Log In"} onPress={handleAuth} />
      <Text onPress={() => setIsSignUp(!isSignUp)}>
        {isSignUp ? "Have an account? Log In" : "No account? Sign Up"}
      </Text>
    </View>
  );
};

export default LoginScreen;
