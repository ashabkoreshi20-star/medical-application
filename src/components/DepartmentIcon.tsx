import React from 'react';
import {
  HeartPulse,
  Brain,
  Bone,
  Baby,
  ShieldPlus,
  Flower2,
  Activity,
  Ambulance,
  Stethoscope,
  LucideProps
} from 'lucide-react';

interface DepartmentIconProps extends LucideProps {
  name: string;
}

export const DepartmentIcon: React.FC<DepartmentIconProps> = ({ name, ...props }) => {
  switch (name) {
    case 'HeartPulse':
      return <HeartPulse {...props} />;
    case 'Brain':
      return <Brain {...props} />;
    case 'Bone':
      return <Bone {...props} />;
    case 'Baby':
      return <Baby {...props} />;
    case 'ShieldPlus':
      return <ShieldPlus {...props} />;
    case 'Flower2':
      return <Flower2 {...props} />;
    case 'Activity':
      return <Activity {...props} />;
    case 'Ambulance':
      return <Ambulance {...props} />;
    default:
      return <Stethoscope {...props} />;
  }
};
