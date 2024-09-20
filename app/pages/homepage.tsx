import React, { useEffect, useState } from 'react';
import LayerMenu from '../components/layer';
import QueryTools from '../components/queryTools';
import OpenLayers from '../components/openLayers';
import "../css/styleHomepage.css"
import { useDispatch, useSelector } from 'react-redux';
import { RootState, store } from '../store/store';
import { setCache } from '../slice/vocabularySlice';

const HomePage: React.FC = () => {
  const dispatch = useDispatch();
  const cacheData = useSelector((state: RootState) => state.vocabulariesSlice.cache);
  const [isCacheLoaded, setIsCacheLoaded] = useState(false);

  //Fetch for call GraphDb and set the cache in the state Redux
  useEffect(() => {
    console.log('Fetching data from GraphDB via API...');
    fetch('/api/graphDb')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Fetched data:', data);
        dispatch(setCache(data));
        setIsCacheLoaded(true);
      })
      .catch(error => {
        console.error('Failed to fetch data from GraphDB:', error);
      });
  }, [dispatch]);

  return (
    <div>
      <div id='homepage' className='flex justify_between'>
        <LayerMenu />
        <OpenLayers />
        {isCacheLoaded && <QueryTools cache={cacheData} />}
      </div>
      <div id='infoClickMap'></div>
    </div>
  );
}

export default HomePage;
