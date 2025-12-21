import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function HomeScreen() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  const colorScheme = useColorScheme();

  // Add a new todo
  const addTodo = () => {
    if (input.trim()) {
      setTodos([...todos, { id: Date.now(), text: input }]);
      setInput('');
    }
  };

  // Delete a todo
  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  // Render a single todo item
  const renderTodo = ({ item }) => (
    <View style={[styles.todoItem, { backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#fff' }]}>
      <Text style={[styles.todoText, { color: colorScheme === 'dark' ? '#fff' : '#333' }]}>
        {item.text}
      </Text>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteTodo(item.id)}
      >
        <Text style={styles.deleteButtonText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#f5f5f5' },
      ]}
    >
      <Text style={[styles.title, { color: colorScheme === 'dark' ? '#fff' : '#333' }]}>
        📝 My To-Do List
      </Text>

      {/* Input Section */}
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#fff',
              color: colorScheme === 'dark' ? '#fff' : '#333',
            },
          ]}
          placeholder="Add a new task..."
          placeholderTextColor={colorScheme === 'dark' ? '#666' : '#999'}
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTodo}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Todos List */}
      {todos.length === 0 ? (
        <Text
          style={[
            styles.emptyText,
            { color: colorScheme === 'dark' ? '#666' : '#999' },
          ]}
        >
          No tasks yet. Add one to get started!
        </Text>
      ) : (
        <FlatList
          data={todos}
          renderItem={renderTodo}
          keyExtractor={(item) => item.id.toString()}
          style={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  input: {
    flex: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  list: {
    marginBottom: 20,
  },
  todoItem: {
    flexDirection: 'row',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderColor: '#ddd',
    borderWidth: 1,
  },
  todoText: {
    fontSize: 16,
    flex: 1,
  },
  deleteButton: {
    backgroundColor: '#ff6b6b',
    borderRadius: 20,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
});
