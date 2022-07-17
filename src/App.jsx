import { NotificationsProvider } from '@mantine/notifications';

import Header from './components/Header.jsx';
import Inputs from './components/Inputs.jsx';
import Map from './components/Map.jsx';

function App() {
  return (
    <NotificationsProvider>
      <div className="h-screen w-screen flex flex-col">
        <Header />
        <div className="h-full flex flex-row">
          <Inputs />
          <Map />
        </div>
      </div>
    </NotificationsProvider>
  );
}

export default App;
