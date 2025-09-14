import React, { useState } from "react";
import {
  Button,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

type Card = {
  id: string;
  name: string;
  count: number;
  image: string;
};

export default function DecklistLookup() {
  const [decklist, setDecklist] = useState("");
  const [cards, setCards] = useState<Card[]>([]);

  const parseDecklist = async () => {
    const lines = decklist
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const fetchedCards: Card[] = [];

    for (let line of lines) {
      const match = line.match(/^(\d+)\s+(.*)$/);
      let count = 1;
      let name = line;

      if (match) {
        count = parseInt(match[1], 10);
        name = match[2];
      }

      try {
        const res = await fetch(
          `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(
            name
          )}`
        );
        const data = await res.json();

        if (data.image_uris?.normal) {
          fetchedCards.push({
            id: data.id,
            name,
            count,
            image: data.image_uris.normal,
          });
        } else if (data.card_faces) {
          fetchedCards.push({
            id: data.id,
            name,
            count,
            image: data.card_faces[0].image_uris.normal,
          });
        }
      } catch (err) {
        console.error(`Error fetching card: ${name}`, err);
      }
    }

    setCards(fetchedCards);
  };

  return (
  <View style={styles.container}>
    <Text style={styles.title}>MTG Decklist Lookup</Text>
      <TextInput
        style={styles.input}
        placeholder="Paste decklist here..."
        value={decklist}
        onChangeText={setDecklist}
        multiline
      />
      <Button title="Import Deck" onPress={parseDecklist} />

      <FlatList
        data={cards}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => (
          <View style={styles.cardContainer}>
            <Image source={{ uri: item.image }} style={styles.cardImage} />
            {item.count > 1 && (
              <View style={styles.countBadge}>
                <Text style={styles.countText}>x{item.count}</Text>
                </View>
            )}
            <Text style={styles.cardText}>
              {item.count}x {item.name}
            </Text>
          </View>
        )}
      />
    </View>        
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 10, marginTop: 40 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  input: {
    borderColor: "#aaa",
    borderWidth: 1,
    padding: 8,
    minHeight: 100,
    marginBottom: 10,
    textAlignVertical: "top",
    color: "#000",
    backgroundColor: "#fff",
      },
  cardContainer: { flex: 1, alignItems: "center", margin: 5 },
  cardImage: { width: 160, height: 220, resizeMode: "contain" },
  cardText: { fontSize: 14, textAlign: "center" },

  countBadge: {
    position: "absolute",
    bottom: 5,
    right: 10,
    backgroundColor: "rgba(0.0.0.0.0.7)",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  countText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },

});
