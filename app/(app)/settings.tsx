// Ajout de la gestion des invitations via username

import { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { supabase } from '../../src/config/supabase';
import { User } from '@supabase/supabase-js';

const FriendsScreen = () => {
  const [username, setUsername] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [friendRequests, setFriendRequests] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error(error);
      } else {
        setUser(user);
      }
    };
    fetchUser();
  }, []);

  const sendFriendRequest = async () => {
    if (!user) return;

    const { data: recipient, error } = await supabase
      .from('users_profile')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !recipient) {
      Alert.alert('Utilisateur introuvable');
      return;
    }

    if (recipient.id === user.id) {
      Alert.alert('Vous ne pouvez pas vous ajouter vous-même.');
      return;
    }

    const { error: updateError } = await supabase
      .from('users_profile')
      .update({ linked_user_id: user.id })
      .eq('id', recipient.id);

    if (updateError) {
      Alert.alert('Erreur lors de l’envoi de l’invitation.');
      console.error(updateError);
    } else {
      Alert.alert('Invitation envoyée !');
    }
  };

  return (
    <View>
      <Text>Ajouter un ami</Text>
      <TextInput
        placeholder="Entrez le username"
        value={username}
        onChangeText={setUsername}
      />
      <Button title="Envoyer l'invitation" onPress={sendFriendRequest} />
    </View>
  );
};

export default FriendsScreen;
