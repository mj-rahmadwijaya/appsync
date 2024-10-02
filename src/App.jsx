import './App.css'
import { useState } from 'react'; 
import GraphqlComponent from './GraphqlComponent';
import DatastoreComponent from './DatastoreComponent';


const App = () => {
  const [show, setShow] = useState(true);

  return (
    <div className='container'>
      <div>
        <button onClick={() =>setShow(true)}>Graphql</button>
        <button onClick={() =>setShow(false)}>Datastore</button>
      </div>
      {
        show ?
        <GraphqlComponent/>
        : <DatastoreComponent/>
      }
    </div>
  );
};

export default App;