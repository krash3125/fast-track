import { useState } from 'react';
import { NotificationsProvider } from '@mantine/notifications';

import Header from './components/Header.jsx';
import Inputs from './components/Inputs.jsx';
import Map from './components/Map.jsx';

const App = () => {
  const [fastestPath, setFastestPath] = useState([]);

  return (
    <NotificationsProvider>
      <div className="h-screen w-screen flex flex-col">
        <Header />
        <div className="h-full flex flex-row">
          <Inputs fastestPath={fastestPath} setFastestPath={setFastestPath} />
          <Map fastestPath={fastestPath} />
        </div>
      </div>
    </NotificationsProvider>
  );
};

export default App;
