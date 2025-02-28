import { View, Text, Button, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../../src/config/supabase";
import { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from '@react-navigation/native';

export default function HomeScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState(false);
  const [userIdLinked, setUserIdLinked] = useState('');
  const [lastMsg, setLastMsg] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("users_profile")
          .select("username")
          .eq("id", user.id)
          .single();
        if (profile) {
          setUser({ ...user, username: profile.username });
        }
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const userLinked = async () => {
    const { data: userLinked, error } = await supabase
      .from('users_profile')
      .select('*')
      .eq('linked_user_id', user?.id)
      .single();
    if (userLinked) {
      setUserIdLinked(userLinked.id);
    }
  }

  const fetchLastMsg = async () => {
    if (!user?.username) return;
    setLoadingMsg(true);
    await userLinked();

    if (!userIdLinked) {
      console.log("Utilisateur lié invalide");
      setLoadingMsg(false);
      return;
    }

    const { data: recipient, error } = await supabase
      .from('users_profile')
      .select('*')
      .eq('id', userIdLinked)
      .single();

    //console.log(recipient);
    // Handle no result of query
    if (error || !recipient || !recipient.last_msg) {
      setLoadingMsg(false); // Pas de dernier message
      return;
    } else {
      setLastMsg(recipient.last_msg);
      setLoadingMsg(false);
    }
  };

  useEffect(() => {
    if (user?.username) {
      fetchLastMsg();
    }
  }, [user?.username]);

  useFocusEffect(
    useCallback(() => {
      fetchLastMsg();
    }, [user?.username])
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
          <Text>Bienvenue {user?.username ? user.username : "sur ton Locket Clone"} !</Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text>Dernier message: {loadingMsg ? (<ActivityIndicator size="small" style={{ marginLeft: 10 }} />) : lastMsg ? lastMsg : "Aucun message"}</Text>
          </View>
          <Button title="Se déconnecter" onPress={handleLogout} />
          <Text>Linked user id : {userIdLinked ? userIdLinked : "N/A"}</Text>
        </>
      )}
    </View>
  );
}