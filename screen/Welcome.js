import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";

export default function Welcome() {
  const navigation = useNavigation()
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap:10, backgroundColor:'#fff' }}>
      <Text style={{ fontSize: 32, marginBottom:10, fontWeight: "bold", color: "#505050" }}>
        Lookout coin
      </Text>
      <Image
        source={require("../assets/images/logo.png")}
        style={{ width: 300, height: 300 }}
      />
      <Text
        style={{
          width: "90%",
          fontSize: 16,
          fontWeight: "600",
          textAlign: "center",
          color: "#505050",
        }}
      >
Utilize nosso aplicativo para acompanhar de perto as cotações das suas moedas favoritas
      </Text>
      <TouchableOpacity onPress={()=> navigation.navigate('Home')}style={{ marginTop: 70, backgroundColor: "#3089bd", paddingHorizontal:70, paddingVertical:12, borderRadius:10 }}>
        <Text style={{ color: "#fff", fontSize: 20, fontWeight: "500" }}>
          Começar
        </Text>
      </TouchableOpacity>
    </View>
  );
}
