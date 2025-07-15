'use client';

import Homepage from './pages/homepage';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { store, RootState } from './store/store';
import { useEffect, useState } from 'react';
import { fetchConfig } from './slice/configSlice';

const HomeContent = () => {
  const configLoading = useSelector((state: RootState) => state.config.loading);
  const layers = useSelector((state: RootState) => state.layerMenuSlice.layers);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!configLoading && layers.length > 0) {
      const isUrlsReplaced = !JSON.stringify(layers).includes('{{GEOSERVER_BASE_URL}}');
      if (isUrlsReplaced) {
        setIsReady(true);
      }
    }
  }, [configLoading, layers]);

  if (!isReady) {
    return <div>Loading...</div>;
  }

  return <Homepage />;
};

export default function Home() {
  useEffect(() => {
    store.dispatch(fetchConfig());
  }, []);

  return (
    <Provider store={store}>
      <main>
        <HomeContent />
      </main>
    </Provider>
  );
}
