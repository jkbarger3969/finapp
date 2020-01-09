import React from 'react';
import SvgIcon, {SvgIconProps} from '@material-ui/core/SvgIcon';

export type DepartmentIconProps = SvgIconProps;

export default function DepartmentIcon(props:SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M12,7V3H2v18h20V7H12z M12,9.5c1.3,0,2.3,1,2.3,2.3c0,1.3-1,2.3-2.3,2.3s-2.3-1-2.3-2.3C9.7,10.6,10.7,9.5,12,9.5z M8,5h2v2
	H8V5z M4,5h2v2H4V5z M6.4,17.9V19H4.1v-1c0-0.9,1.2-1.7,2.9-1.9C6.7,16.6,6.4,17.2,6.4,17.9z M5.4,13.1c0-1.1,0.9-2,2-2
	c0.4,0,0.7,0.1,1,0.3c-0.1,0.9,0.2,1.9,0.7,2.6c-0.3,0.6-1,1.1-1.7,1.1C6.3,15.1,5.4,14.2,5.4,13.1z M16.3,19H7.7v-1.1
	c0-1.4,1.9-2.5,4.3-2.5s4.3,1.1,4.3,2.5V19z M14.8,14.1c0.6-0.7,0.8-1.7,0.7-2.6c0.3-0.2,0.6-0.3,1-0.3c1.1,0,2,0.9,2,2s-0.9,2-2,2
	C15.8,15.1,15.2,14.7,14.8,14.1z M19.9,19h-2.3v-1.1c0-0.7-0.2-1.3-0.6-1.7c1.7,0.2,2.9,1,2.9,1.9V19z" />
    </SvgIcon>
  );
}