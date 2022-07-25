import { useState, useEffect } from 'react';
import {
  Title,
  Divider,
  Button,
  Badge,
  LoadingOverlay,
  Autocomplete,
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';

import a from 'axios';
const axios = a.default;

import getDistance from 'geolib/es/getDistance';
import countapi from 'countapi-js';

const Inputs = ({ setFastestPath }) => {
  const [startInput, setStartInput] = useState('');
  const [endInput, setEndInput] = useState('');

  const [stopsInput, setStopsInput] = useState(['']);
  const [stopsLatLong, setStopsLatLong] = useState([]);

  const [startLatLong, setStartLatLong] = useState({});
  const [endLatLong, setEndLatLong] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    countapi.hit('fasttrack.vercel.app', 'webvisits');
  }, []);

  const handleChange = (i, e) => {
    let newStopInputs = [...stopsInput];
    newStopInputs[i] = e;
    setStopsInput(newStopInputs);
  };

  const addInput = () => {
    setStopsInput([...stopsInput, '']);
  };

  const deleteInput = (i) => {
    let newStopInputs = [...stopsInput];
    newStopInputs.splice(i, 1);
    setStopsInput(newStopInputs);
  };

  const addressToLatLong = async (addresses) => {
    let tempData = [];
    let returnData = [];

    for (let i = 0; i < addresses.length; i++) {
      returnData = new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(
            axios
              .get(
                `https://api.tomtom.com/search/2/search/${addresses[i].replace(
                  ' ',
                  '+'
                )}.json?key=${import.meta.env.VITE_TOMTOM_API}&limit=1`
              )
              .then((res) => {
                tempData.push(res.data.results[0]);
              })
              .catch((err) => {
                showNotification({
                  title: 'API Error',
                  message: 'Please try again later. 🤥',
                  color: 'red',
                });
              })
              .then(() => {
                return tempData;
              })
          );
        }, 200 * i);
      });
    }

    return returnData;
  };

  const loadStopsData = async () => {
    countapi.update(
      'fasttrack.vercel.app',
      'addrprocessed',
      2 + stopsInput.length
    );
    setStopsLatLong([]);
    const latLongData = await addressToLatLong([
      startInput,
      ...stopsInput,
      endInput,
    ]);
    return [
      [latLongData[0]],
      latLongData.splice(1, latLongData.length - 2),
      [latLongData[latLongData.length - 1]],
    ];
  };

  const getTotalDistance = (stops) => {
    let distance = 0;
    for (let i = 0; i < stops.length - 1; i++) {
      distance += getDistance(
        {
          latitude: stops[i].position.lat,
          longitude: stops[i].position.lon,
        },
        {
          latitude: stops[i + 1].position.lat,
          longitude: stops[i + 1].position.lon,
        }
      );
    }
    return distance;
  };

  const permutator = (inputArr) => {
    let result = [];
    const permute = (arr, m = []) => {
      if (arr.length === 0) {
        result.push(m);
      } else {
        for (let i = 0; i < arr.length; i++) {
          let curr = arr.slice();
          let next = curr.splice(i, 1);
          permute(curr.slice(), m.concat(next));
        }
      }
    };
    permute(inputArr);
    return result;
  };

  const calcFastestPath = async () => {
    const allStopsData = await loadStopsData();
    const startingPoint = allStopsData[0];
    const endingPoint = allStopsData[allStopsData.length - 1];

    let newStopsLatLong = [...allStopsData];
    newStopsLatLong.splice(0, 1);
    newStopsLatLong.splice(newStopsLatLong.length - 1, newStopsLatLong.length);
    newStopsLatLong = newStopsLatLong[0];

    permutator(newStopsLatLong);

    const perms = permutator(newStopsLatLong);
    let distancesArr = [];

    perms.forEach((perm) => {
      distancesArr.push(
        getTotalDistance([...startingPoint, ...perm, ...endingPoint])
      );
    });
    const min = Math.min(...distancesArr);
    const minIndex = distancesArr.indexOf(min);

    setStartLatLong(startingPoint);
    setEndLatLong(endingPoint);
    setStopsLatLong(newStopsLatLong);

    setFastestPath([...startingPoint, ...perms[minIndex], ...endingPoint]);

    setLoading(false);
  };

  const autocompleteDataFetch = async (address) => {
    return axios
      .get(
        `https://api.geocodify.com/v2/autocomplete%20?api_key=${
          import.meta.env.VITE_GEOCODIFY_API
        }&q=${address.replace(' ', '+')}`
      )
      .then((res) => {
        return [
          ...new Set(
            res.data.response.features.map((res) => res.properties.label)
          ),
        ];
      })
      .catch((err) => {
        showNotification({
          title: 'Autocomplete API Error',
          message: 'Sorry for the inconvenience! 🤥',
          color: 'red',
        });
        return [];
      });
  };

  const [data, setData] = useState([]);
  const [timer, setTimer] = useState(null);
  const [settingLoc, setSettingLoc] = useState(false);

  useEffect(() => {
    if (startInput.length > 3 && !settingLoc) {
      const timeOutId = setTimeout(async () => {
        setData(await autocompleteDataFetch(startInput));
      }, 500);
      return () => clearTimeout(timeOutId);
    }
    setSettingLoc(false);
  }, [startInput]);

  useEffect(() => {
    if (endInput.length > 3 && !settingLoc) {
      const timeOutId = setTimeout(async () => {
        setData(await autocompleteDataFetch(endInput));
      }, 500);
      return () => clearTimeout(timeOutId);
    }
    setSettingLoc(false);
  }, [endInput]);

  return (
    <div className="h-full w-1/3 flex flex-col gap-2 border border-solid border-ft-grey bg-[#F8F9FA] p-2 overflow-y-auto">
      <Title order={4}>Starting Location</Title>
      <Autocomplete
        placeholder="Starting Location"
        value={startInput}
        onChange={setStartInput}
        data={data}
        filter={(value, item) => {
          if (value.length > 3) {
            return item.value
              .toLowerCase()
              .trim()
              .includes(value.toLowerCase().trim());
          } else return '';
        }}
        onItemSubmit={() => {
          setSettingLoc(true);
        }}
      />
      <Title order={4}>Ending Location</Title>
      <Autocomplete
        placeholder="Ending Location"
        value={endInput}
        onChange={setEndInput}
        data={data}
        filter={(value, item) => {
          if (value.length > 3) {
            return item.value
              .toLowerCase()
              .trim()
              .includes(value.toLowerCase().trim());
          } else return '';
        }}
        onItemSubmit={() => {
          setSettingLoc(true);
        }}
      />
      <Divider my="xs" label="STOPS" labelPosition="center" />
      <div className="h-full flex flex-col gap-2 overflow-y-auto">
        {stopsInput.map((value, i) => (
          <Autocomplete
            key={i}
            value={value}
            onChange={(e) => {
              handleChange(i, e);

              if (e.length > 3) {
                if (
                  e.length - 1 !== value.length &&
                  e.length - 1 > value.length
                ) {
                } else {
                  clearTimeout(timer);
                  const newTimer = setTimeout(async () => {
                    setData(await autocompleteDataFetch(e));
                  }, 500);
                  setTimer(newTimer);
                }
              }
            }}
            placeholder="Add a Stop Point"
            rightSectionWidth={50}
            rightSection={
              <Badge
                className="text-white font-bold hover:cursor-pointer"
                color="red"
                variant="filled"
                onClick={() => deleteInput(i)}
              >
                x
              </Badge>
            }
            data={data}
            filter={(value, item) => {
              if (value.length > 3) {
                return item.value
                  .toLowerCase()
                  .trim()
                  .includes(value.toLowerCase().trim());
              } else return '';
            }}
          />
        ))}
        <div className="h-fit">
          <Button fullWidth onClick={addInput}>
            Add More
          </Button>
        </div>
      </div>
      <div className="h-fit">
        <Divider my="xs" />
        <Button
          color="green"
          fullWidth
          onClick={() => {
            if (
              startInput === '' ||
              endInput === '' ||
              stopsInput.includes('')
            ) {
              //pop the noti
              showNotification({
                title: 'Input Error',
                message: 'Not all inputs are fill out! 🤥',
                color: 'red',
              });
            } else if (stopsInput.length === 0) {
              showNotification({
                title: 'Input Error',
                message: 'No stops included! 🤥',
                color: 'red',
              });
            } else {
              setLoading(true);
              calcFastestPath();
              countapi.hit('fasttrack.vercel.app', 'routescalc');
            }
          }}
        >
          Find Shortest Path
        </Button>
      </div>
      <LoadingOverlay className="h-full w-1/3 mt-14" visible={loading} />
    </div>
  );
};

export default Inputs;
