import React from 'react';
import { createRoot } from 'react-dom/client';

import './assets/style.scss';
import Recommendations from './Components/Recommendations';
import Logo from './assets/TreKommend.png';
const App = () => {
  return (
    <div>
      <header>
        <img src={Logo} alt="TreKommend Logo" className="logo" />
      </header>
      <Recommendations />
    </div>
  );
};

createRoot(document.querySelector('#root')!).render(<App />);
export default App;
