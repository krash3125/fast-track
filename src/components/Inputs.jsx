import { useEffect, useState } from 'react';
import {
  Title,
  Input,
  Divider,
  Button,
  Badge,
  Notification,
  LoadingOverlay,
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';

import a from 'axios';
const axios = a.default;

import getDistance from 'geolib/es/getDistance';

const Inputs = ({ fastestPath, setFastestPath }) => {
  const [stopsInput, setStopsInput] = useState([
    '4345 Hilton Avenue San Jose CA USA',
    '1640 Clarkspur San Jose CA 95129 USA',
    '7068 Phyllis Avenue San Jose CA 95129 United States',
  ]);
  const [stopsLatLong, setStopsLatLong] = useState([]);

  const [startInput, setStartInput] = useState(
    '1434 Pine Grove Way San Jose California 95129 United States'
  );
  const [endInput, setEndInput] = useState(
    '6501 Hanover Drive San Jose CA 95129 United States'
  );
  const [startLatLong, setStartLatLong] = useState({});
  const [endLatLong, setEndLatLong] = useState({});

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log(stopsLatLong);
  }, [stopsLatLong]);

  const handleChange = (i, e) => {
    let newStopInputs = [...stopsInput];
    newStopInputs[i] = e.target.value;
    setStopsInput(newStopInputs);
    console.log(newStopInputs);
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
    addresses.forEach((address) => {
      returnData = axios
        .get(
          `https://api.positionstack.com/v1/forward?access_key=${
            import.meta.env.VITE_POSITIONSTACK_API
          }&query=${address.replace(' ', '+')}&limit=1`
        )
        .then((res) => {
          tempData.push(res.data.data[0]);
        })
        .catch((err) => console.error(err))
        .then(() => {
          return tempData;
        });
    });
    return returnData;
  };

  const loadStopsData = async () => {
    setStopsLatLong([]);
    let startAddress = [startInput];
    let endAddress = [endInput];
    let stopsAdresses = [...stopsInput];
    return [
      await addressToLatLong(startAddress),
      await addressToLatLong(stopsAdresses),
      await addressToLatLong(endAddress),
    ];
  };

  const getTotalDistance = (stops) => {
    let distance = 0;

    for (let i = 0; i < stops.length - 2; i++) {
      // console.log('stops[i]', stops[i]);
      // console.log('stops[i+1]', stops[i + 1]);
      distance += getDistance(
        {
          latitude: stops[i].latitude,
          longitude: stops[i].longitude,
        },
        {
          latitude: stops[i + 1].latitude,
          longitude: stops[i + 1].longitude,
        }
      );
    }
    console.log('distance', distance);
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
    // console.log('allstopsdata', allStopsData);

    const startingPoint = allStopsData[0];
    const endingPoint = allStopsData[allStopsData.length - 1];

    let newStopsLatLong = [...allStopsData];
    newStopsLatLong.splice(0, 1);
    newStopsLatLong.splice(newStopsLatLong.length - 1, newStopsLatLong.length);
    newStopsLatLong = newStopsLatLong[0];

    console.log('--------------------------------');
    console.log('starting data', startingPoint);
    console.log('middle data', newStopsLatLong);
    console.log('ending data', endingPoint);
    console.log('--------------------------------');

    permutator(newStopsLatLong);

    const perms = permutator(newStopsLatLong);
    console.log('perms', perms);

    // console.log(
    //   );
    let distancesArr = [];

    perms.forEach((perm) => {
      distancesArr.push(
        getTotalDistance([...startingPoint, ...perm, ...endingPoint])
      );
    });
    const min = Math.min(...distancesArr);
    const minIndex = distancesArr.indexOf(min);
    console.log(distancesArr);
    console.log(min);
    console.log(minIndex);
    console.log(perms[minIndex]);
    console.log([...startingPoint, ...perms[minIndex], ...endingPoint]);

    setStartLatLong(startingPoint);
    setEndLatLong(endingPoint);
    setStopsLatLong(newStopsLatLong);

    setFastestPath([...startingPoint, ...perms[minIndex], ...endingPoint]);

    setLoading(false);
  };

  return (
    <div className="h-full w-1/3 flex flex-col gap-2 border border-solid border-ft-grey bg-[#F8F9FA] p-2">
      <Title order={4}>Starting Location</Title>
      <Input
        placeholder="Starting Location"
        value={startInput}
        onChange={(e) => setStartInput(e.target.value)}
      />
      <Title order={4}>Ending Location</Title>
      <Input
        placeholder="Ending Location"
        value={endInput}
        onChange={(e) => setEndInput(e.target.value)}
      />

      <Divider my="xs" label="STOPS" labelPosition="center" />

      <div className="h-full flex flex-col gap-2 overflow-y-auto">
        {stopsInput.map((value, i) => (
          <Input
            key={i}
            value={value}
            onChange={(e) => handleChange(i, e)}
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
          />
        ))}
        <Button fullWidth onClick={addInput}>
          Add More
        </Button>
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

{
  /* <Notification color="red" title="We notify you that">
        You are now obligated to give a star to Mantine project on GitHub
      </Notification> 
      
      
      ,
                styles: (theme) => ({
                  root: {
                    backgroundColor: theme.colors.red[6],
                    borderColor: theme.colors.red[6],

                    '&::before': { backgroundColor: theme.white },
                  },
                  title: { color: theme.white },
                  description: { color: theme.white },
                  closeButton: {
                    color: theme.white,
                    '&:hover': { backgroundColor: theme.colors.red[7] },
                  },
                }),
      */
}
