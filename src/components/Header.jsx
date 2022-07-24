import { useState } from 'react';
import { Title, Popover, Text, Button } from '@mantine/core';
import { Question, Info } from 'phosphor-react';
import Logo from '../assets/logo.png';

const Header = () => {
  const [opened, setOpened] = useState(false);

  return (
    <div className="h-14 flex items-center bg-white text-black border border-solid border-ft-grey bg-[#e7e8ea] p-2">
      <img src={Logo} alt="logo" className="h-10 w-10" />
      <Title className="ml-2" order={1}>
        Fast Track
      </Title>

      <Popover
        className="ml-auto"
        opened={opened}
        onClose={() => setOpened(false)}
        target={
          <Question
            className="ml-auto hover:cursor-pointer"
            size={32}
            color="#DA0D2A"
            weight="bold"
            onClick={() => setOpened(!opened)}
          />
        }
        width={300}
        radius="md"
        spacing="xs"
        shadow="lg"
        position="bottom-end"
        withArrow
      >
        <div className="flex flex-row ">
          <Info size={26} color="#DA0D2A" weight="fill" />
          <Text className="ml-2 w-5/6" size="sm">
            Enter a starting and ending location and stops in between and Fast
            Track will take your inputted destinations and calculates the most
            efficient and optimized route you can take.
          </Text>
        </div>
      </Popover>
    </div>
  );
};

export default Header;
