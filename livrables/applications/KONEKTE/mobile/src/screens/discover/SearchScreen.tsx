import { useState } from "react";
import { View, Text, TextInput, FlatList, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { searchProfiles } from "../../api/discover.api";
import { SearchResult } from "../../types";
import Avatar from "../../components/Avatar";
import type { DiscoverStackParamList } from "../../navigation/DiscoverStack";

type Props = NativeStackScreenProps<DiscoverStackParamList, "Search">;

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export default function SearchScreen({ navigation }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const runSearch = (value: string) => {
    if (value.trim().length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    searchProfiles(value)
      .then((r) => {
        setResults(r);
        setSearched(true);
      })
      .finally(() => setLoading(false));
  };

  const onChangeText = (value: string) => {
    setQuery(value);
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => runSearch(value), 400);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#999" />
        <TextInput
          style={styles.input}
          placeholder="Rechercher par prénom..."
          value={query}
          onChangeText={onChangeText}
          autoFocus
        />
        {loading && <ActivityIndicator size="small" color="#E11D74" />}
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.userId}
        contentContainerStyle={results.length === 0 ? styles.emptyContainer : undefined}
        ListEmptyComponent={
          searched ? (
            <Text style={styles.emptyText}>Aucun résultat pour "{query}"</Text>
          ) : (
            <Text style={styles.emptyText}>Tape au moins 2 lettres pour chercher un prénom</Text>
          )
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() => navigation.navigate("ProfileDetail", { userId: item.userId })}
          >
            <Avatar uri={item.mainPhoto} size={48} />
            <View style={styles.rowInfo}>
              <Text style={styles.name}>
                {item.firstName}, {item.age}
              </Text>
              <Text style={styles.city}>{item.city}</Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    margin: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  input: { flex: 1, fontSize: 16 },
  emptyContainer: { flexGrow: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { color: "#666", fontSize: 14, paddingHorizontal: 32, textAlign: "center" },
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, gap: 12 },
  rowInfo: { flex: 1 },
  name: { fontSize: 16, fontWeight: "600" },
  city: { fontSize: 13, color: "#777", marginTop: 2 },
});
