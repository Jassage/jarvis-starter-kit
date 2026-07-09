import { Image, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  uri?: string | null;
  size: number;
}

export default function Avatar({ uri, size }: Props) {
  const dimensionStyle = { width: size, height: size, borderRadius: size / 2 };

  if (!uri) {
    return (
      <View style={[styles.placeholder, dimensionStyle]}>
        <Ionicons name="person" size={size * 0.55} color="#bbb" />
      </View>
    );
  }

  return <Image source={{ uri }} style={[styles.image, dimensionStyle]} />;
}

const styles = StyleSheet.create({
  image: { backgroundColor: "#eee" },
  placeholder: { backgroundColor: "#eee", alignItems: "center", justifyContent: "center" },
});
