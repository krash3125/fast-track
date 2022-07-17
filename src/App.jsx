import { useState } from 'react';
import { Input } from '@mantine/core';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="h-screen w-screen flex flex-col bg-blue-200">
      <div className="h-10 bg-red-500">Header</div>
      <div className="h-full flex flex-row">
        <div className="h-full w-1/5 bg-green-500">
          Start
          <Input />
          End
          <Input />
          Add more
        </div>
        <div className="h-full w-4/5 bg-zinc-500">Map</div>
      </div>
    </div>
  );
}

export default App;
