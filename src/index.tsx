import React from 'react';
import ReactDOM from 'react-dom/client';
import Bonx from './Bonx';

const root: ReactDOM.Root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
     <Bonx />
  </React.StrictMode>
);
