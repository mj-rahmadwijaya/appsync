import { useEffect, useState } from 'react';
import { DataStore, syncExpression } from 'aws-amplify/datastore';
import { Todo } from './models';

const initialState = {
    name: '',
    description: '',
};
const initialStateUpdate = {
    name: '',
    description: '',
};
const DatastoreComponent = () => {
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

    const addTodo = async () => {
        try {
            if (!formState.name || !formState.description) return;
            await DataStore.save(
                new Todo({
                    name:'#DS '+formState.name,
                    description: formState.description,
                })
            );
            setFormState(initialState)
        } catch (error) {
            console.log(error);
        }
    }

    const clickDelete = async (id) => {
        try {
            const todelete = await DataStore.query(Todo, id);
            DataStore.delete(todelete);
        } catch (err) {
            console.log('error deleted todo:', err);
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
            console.log(formupdate);
            
            const original = await DataStore.query(Todo, formupdate.id);
  
            await DataStore.save(
              Todo.copyOf(original, updated => {
                updated.name = formupdate.name,
                updated.description = formupdate.description
              })
            );
            setShow(true);
        } catch (err) {
          console.log('error creating todo:', err);
        }
      }

    useEffect(() => {
        const sub = DataStore.observeQuery(Todo).subscribe((data) => {
            setTodos(data.items)
        });
        return () => {
            sub.unsubscribe()
        };

    }, []);

    return (
        <div className='container'>
            <h2>Amplify Todos Datastore</h2>
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

export default DatastoreComponent;