import { View, Text, Button, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../../src/config/supabase";
import { useState, useEffect } from "react";

export default function HomeScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);

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
          setUsername(profile.username);
        }
        setLoading(false)
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {loading && (
        <>
          <ActivityIndicator size="large"/>
        </>
      )}
      {!loading && (
        <>
          <Text>Bienvenue {username ? username : "sur ton Locket Clone"} !</Text>
          <Button title="Se déconnecter" onPress={handleLogout} />
        </>
      )}
    </View>
  );
}
