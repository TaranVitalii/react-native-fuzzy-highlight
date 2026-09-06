import { useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { HighlightText } from 'react-native-fuzzy-highlight';

const PRODUCTS = [
  'Acma super zyntek',
  'Acme comet flow',
  'Vortex glimmer',
  'Acme lunar drift',
  'Orbit zyntek',
];

export default function App() {
  const [query, setQuery] = useState('Acme zyntek');

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        style={styles.input}
        value={query}
        onChangeText={setQuery}
        placeholder="Search..."
        autoCapitalize="none"
        autoCorrect={false}
      />
      <FlatList
        data={PRODUCTS}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <HighlightText
              text={item}
              query={query}
              style={styles.text}
              highlightStyle={styles.highlight}
            />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  input: {
    margin: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  text: {
    fontSize: 16,
  },
  highlight: {
    backgroundColor: '#fff3a3',
    fontWeight: '700',
  },
});
