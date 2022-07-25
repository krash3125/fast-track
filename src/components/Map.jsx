import { useState, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Circle,
} from 'react-leaflet';
import { Share } from 'phosphor-react';

const blueOptions = { color: 'blue' };
const fillGreenOptions = { color: 'green', fillColor: 'green' };
const fillRedOptions = { color: 'red', fillColor: 'red' };

const Map = ({ fastestPath }) => {
  const [polyline, setPolyline] = useState([]);

  useEffect(() => {
    let newPolyline = [];
    fastestPath.forEach((stop) => {
      newPolyline.push([stop.position.lat, stop.position.lon]);
    });
    setPolyline(newPolyline);
  }, [fastestPath]);

  return (
    <div className="relative h-full w-2/3 z-0 overflow-hidden">
      {fastestPath.length !== 0 && (
        <div
          className="absolute bottom-8 right-8 h-16 w-16 flex justify-center items-center bg-red-700 !z-50 rounded-full hover:cursor-pointer"
          onClick={() => {
            let link = 'https://www.google.com/maps/dir/';
            fastestPath.forEach((stop, i) => {
              link += stop.address.freeformAddress.replace(' ', '+') + '/';
            });
            window.open(link, '_blank');
          }}
        >
          <Share size={36} color="#fff" weight="bold" />
        </div>
      )}
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
                  center={[marker.position.lat, marker.position.lon]}
                  pathOptions={fillGreenOptions}
                  radius={100}
                />
              ) : (
                <></>
              )}
              {index === fastestPath.length - 1 ? (
                <Circle
                  center={[marker.position.lat, marker.position.lon]}
                  pathOptions={fillRedOptions}
                  radius={100}
                />
              ) : (
                <></>
              )}

              <Marker
                styles={{ backgroundColor: 'red' }}
                position={[marker.position.lat, marker.position.lon]}
              >
                <Popup>
                  {marker.type === 'POI'
                    ? marker.poi.name
                    : marker.address.freeformAddress}
                </Popup>
              </Marker>
            </div>
          );
        })}
        <Polyline pathOptions={blueOptions} positions={polyline} />
      </MapContainer>
    </div>
  );
};

export default Map;
