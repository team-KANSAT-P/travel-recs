import React from 'react';
import { createRoot } from 'react-dom/client';

import './assets/style.scss';
import Recommendations from './Components/Recommendations';

const App = () => {
  return (
    <div>
      <Recommendations />
    </div>
  );
};

createRoot(document.querySelector('#root')!).render(<App />);

export default App;
