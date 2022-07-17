import { Title } from '@mantine/core';
import Logo from '../assets/logo.png';

const Header = () => {
  return (
    <div className="h-14 flex items-center bg-white text-black border border-solid border-ft-grey bg-[#e7e8ea] p-2">
      <img src={Logo} alt="logo" className="h-10 w-10" />
      <Title className="ml-2" order={1}>
        Fast Track
      </Title>
    </div>
  );
};

export default Header;
