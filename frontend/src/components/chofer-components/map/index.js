import dynamic from 'next/dynamic';

// import MapComponent from './MapComponent';
const Map = dynamic(() => import('./MapComponent'), {
  ssr: false,
});

export default Map

// import MapComponent from './MapComponent';
export const MapMov = dynamic(() => import('./MapComponentMov'), {
  ssr: false,
});

