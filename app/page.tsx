'use client';

import Homepage from './pages/homepage';
import { Provider } from 'react-redux';
import { store } from './store/store';

export default function Home() { 
  return (
    <Provider store={store}>
      <main>
        <Homepage />
      </main>
    </Provider>
  );
}
