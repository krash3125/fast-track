import { useState, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Circle,
} from 'react-leaflet';

const Map = ({ fastestPath }) => {
  const [polyline, setPolyline] = useState([]);

  useEffect(() => {
    let newPolyline = [];
    fastestPath.forEach((stop) => {
      newPolyline.push([stop.latitude, stop.longitude]);
    });
    setPolyline(newPolyline);
  }, [fastestPath]);

  const limeOptions = { color: 'blue' };
  const fillGreenOptions = { color: 'green', fillColor: 'green' };
  const fillRedOptions = { color: 'red', fillColor: 'red' };

  return (
    <div className="relative h-full w-2/3 z-0 overflow-hidden">
      <div className="absolute top-0 right-0 h-16 w-16 bg-red-800 !z-50"></div>
      <MapContainer
        className="h-full w-full z-20"
        center={[
          fastestPath[0]?.latitude || 37.303598,
          fastestPath[0]?.latitude || -122.026897,
        ]}
        zoom={13}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {fastestPath.map((marker, index) => {
          return (
            <div key={index}>
              {index === 0 ? (
                <Circle
                  center={[marker.latitude, marker.longitude]}
                  pathOptions={fillGreenOptions}
                  radius={100}
                />
              ) : (
                <></>
              )}
              {index === fastestPath.length - 1 ? (
                <Circle
                  center={[marker.latitude, marker.longitude]}
                  pathOptions={fillRedOptions}
                  radius={100}
                />
              ) : (
                <></>
              )}

              <Marker
                styles={{ backgroundColor: 'red' }}
                position={[marker.latitude, marker.longitude]}
              >
                <Popup>{marker.label}</Popup>
              </Marker>
            </div>
          );
        })}
        <Polyline pathOptions={limeOptions} positions={polyline} />
      </MapContainer>
    </div>
  );
};

export default Map;
