import './App.css'
import { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import { createTodo, updateTodo, deleteTodo } from './graphql/mutations';
import { listTodos } from './graphql/queries';
import * as subscriptions from './graphql/subscriptions';

const initialState = {
  name: '',
  description: '',
};
const initialStateUpdate = {
  name: '',
  description: '',
};
const client = generateClient();

const App = () => {
  const [formState, setFormState] = useState(initialState);
  const [todos, setTodos] = useState([]);
  const [show, setShow] = useState(true);
  const [formupdate, setFormUpdate] = useState(initialStateUpdate);

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value });
  }

  function setInputUpdate(key, value) {
    setFormUpdate({ ...formupdate, [key]: value });
  }

  async function fetchTodos() {
    try {
      const todoData = await client.graphql({
        query: listTodos
      });
      const todos = todoData.data.listTodos.items;
      setTodos(todos);
    } catch (err) {
      console.log('error fetching todos');
    }
  }

  async function addTodo() {
    try {
      if (!formState.name || !formState.description) return;
      setFormState(initialState)
      await client.graphql({
        query: createTodo,
        variables: {
          input: formState
        }
      });
    } catch (err) {
      console.log('error creating todo:', err);
    }
  }

  const clickUpdate = (data) => {
    let x = {
      id: data.id,
      name: data.name,
      description: data.description
    }
    setFormUpdate(x)
    setShow(false);
  }

  async function handleUpdateTodo() {
    try {
      if (!formupdate.name || !formupdate.description) return;
      setFormUpdate(initialState);
      await client.graphql({
        query: updateTodo,
        variables: {
          input: formupdate
        }
      });
      setShow(true);
    } catch (err) {
      console.log('error creating todo:', err);
    }
  }

  const clickDelete = async (data) => {
    try {
      await client.graphql({
        query: deleteTodo,
        variables: {
          input: { id: data }
        }
      });
    } catch (err) {
      console.log('error creating todo:', err);
    }
  }

  useEffect(() => {
    fetchTodos();
  }, [])

  useEffect(() => {
    const createSub = client
      .graphql({ query: subscriptions.onCreateTodo })
      .subscribe({
        next: ({ data }) => {
          console.log(todos);
          console.log(data.onCreateTodo);
          
          setTodos([...todos, data.onCreateTodo])
        },
        error: (error) => console.warn(error)
      });

    const updateSub = client
      .graphql({ query: subscriptions.onUpdateTodo })
      .subscribe({
        next: ({ data }) => {
          const todoIndex = todos.findIndex((item) => item.id === data.onUpdateTodo.id);
          todos[todoIndex].name = data.onUpdateTodo.name;
          todos[todoIndex].description = data.onUpdateTodo.description;
          todos[todoIndex].updatedAt = data.onUpdateTodo.updatedAt;
          setTodos([...todos])
        },
        error: (error) => console.warn(error)
      });

    const deleteSub = client
      .graphql({ query: subscriptions.onDeleteTodo })
      .subscribe({
        next: ({ data }) => {
          console.log(data);
          const todoIndex = todos.findIndex((item) => item.id === data.onDeleteTodo.id);
          console.log(todoIndex);
          todos.splice(todoIndex, 1);
          setTodos([...todos])
        },
        error: (error) => console.warn(error)
      });
    return () => {
      createSub.unsubscribe();
      updateSub.unsubscribe();
      deleteSub.unsubscribe();
    };
  }, []);

  return (
    <div className='container'>
      <h2>Amplify Todos</h2>
      {show ?
        <div className='form'>
          <input
            onChange={(event) => setInput('name', event.target.value)}
            value={formState.name}
            placeholder="Name"
          />
          <input
            onChange={(event) => setInput('description', event.target.value)}
            value={formState.description}
            placeholder="Description"
          />
          <button onClick={addTodo}>
            Create Todo
          </button>
        </div>
        :
        <div className='form'>
          <input
            onChange={(event) => setInputUpdate('name', event.target.value)}
            value={formupdate.name}
            placeholder="Name"
          />
          <input
            onChange={(event) => setInputUpdate('description', event.target.value)}
            value={formupdate.description}
            placeholder="Description"
          />
          <button onClick={handleUpdateTodo}>
            Update Todo
          </button>
        </div>
      }
      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>Name</th>
            <th>Description</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {todos.map((todo, index) => (
            <tr key={todo.id ? todo.id : index}>
              <td>{index + 1}</td>
              <td>{todo.name}</td>
              <td>{todo.description}</td>
              <td>
                <button onClick={() => clickUpdate(todo)}>Update</button>
                <button onClick={() => clickDelete(todo.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;