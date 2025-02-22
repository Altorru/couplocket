import { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../../src/config/supabase';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'expo-router';

const FriendsScreen = () => {
  const [username, setUsername] = useState('');
  const [user, setUser] = useState<User | null>(null); //Define current connected user variable
  const [userLinked, setUserLinked] = useState(false);
  const [usernameLinked, setUsernameLinked] = useState('');
  const [userIdLinked, setUserIdLinked] = useState('');
  const [shouldReload, setShouldReload] = useState(false);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => { // Get the current connected user
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error(error);
      } else {
        setUser(user);

        const { data: recipient, error } = await supabase
          .from('users_profile')
          .select('*')
          .eq('id', user?.id)
          .single();
  
        // Handle no result of query
        if (!recipient.linked_user_id) {
          //Alert.alert('Utilisateur non lié');
          setLoading(false)
          return;
        } else {
          const { data: userLinked, error } = await supabase
            .from('users_profile')
            .select('*')
            .eq('id', recipient.linked_user_id)
            .single();
          setUsernameLinked(userLinked.username);
          setUserIdLinked(userLinked.id);
          setUserLinked(true);
          setLoading(false)
        }
        //setLoading(false)
      }
    };
    fetchUser();
  }, [shouldReload]);

  const linkUsers = async () => { // Handle friend add button
    if (!user) return; // Check if current connected user is defined
    setLoading(true)
    // Try to get a profile with username asked by user
    const { data: recipient, error } = await supabase
      .from('users_profile')
      .select('*')
      .eq('username', username)
      .single();

    // Handle no result of query
    if (error || !recipient) {
      Alert.alert('Utilisateur introuvable');
      setUsername('')
      setLoading(false)
      return;
    }

    // Handle connected user try to add itself
    if (recipient.id === user.id) {
      Alert.alert('Vous ne pouvez pas vous ajouter vous-même.');
      setUsername('')
      setLoading(false)
      return;
    }

    // Add the linked_user_id value to connected user profile
    const { error: updateError } = await supabase
      .from('users_profile')
      .update({ linked_user_id: user.id })
      .eq('id', recipient.id);

    // Handle error when setting the value in the query
    if (updateError) {
      Alert.alert('Erreur lors de l’envoi de l’invitation.');
      console.error(updateError);
    } else {
      const { error: updateError } = await supabase
        .from('users_profile')
        .update({ linked_user_id: recipient.id })
        .eq('id', user.id);
      if (updateError) {
        Alert.alert('Erreur lors de la mise à jour du linked_user_id.');
        console.error(updateError);
      } else {
        //Alert.alert('Invitation envoyée et linked_user_id mis à jour !');
        setUserLinked(true);
        setUsername('');
        setShouldReload(!shouldReload); // Trigger re-fetch of user data
      }
    }
  };

  const unlinkUsers = async () => { // Handle friend unlink button
    if (!user) return; // Check if current connected user is defined

    try {
      setLoading(true)
      // Update the current user's profile
      await supabase
        .from('users_profile')
        .update({ linked_user_id: null })
        .eq('id', user.id);

      // Update the linked user's profile
      await supabase
        .from('users_profile')
        .update({ linked_user_id: null })
        .eq('id', userIdLinked);

      //Alert.alert('Utilisateurs déliés avec succès');
      setUserLinked(false);
      setUsernameLinked('');
      setUserIdLinked('');
      setLoading(false)
      setShouldReload(!shouldReload); // Trigger re-fetch of user data
    } catch (error) {
      Alert.alert('Impossible de délier les utilisateurs');
      console.error(error);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {loading && (
        <>
          <ActivityIndicator size="large"/>
        </>
      )}
      {loading || !userLinked && (
        <>
          <Text>Ajouter un ami</Text>
          <TextInput
            editable={!userLinked}
            placeholder="Entrez le username"
            value={username}
            onChangeText={setUsername}
          />
          <Button title="Envoyer l'invitation" onPress={linkUsers} />
        </>
      )}
      {loading || userLinked && (
        <>
          <Text>Tu es lié à {usernameLinked}</Text>
          <Button title="Délier" onPress={unlinkUsers} />
        </>
      )}
    </View>
  );
};

export default FriendsScreen;
