import React from 'react';
import Numeral from 'numeral';

function formatZeros(num) {
   let numSplit = num.toString().split('.');

   return (
      <span>
         <span style={{ opacity: numSplit[0] === '0' ? 0.4 : 1 }}>{numSplit[0]}</span>.
         <span style={{ opacity: numSplit[1] === '00' ? 0.4 : 1 }}>{numSplit[1]}</span>
      </span>
   );
}

const Number = ({ val, type }) => {
   return <span>{formatZeros(Numeral(val).format(type === 'BTC' ? '0,0.0000' : '0,0.00'))}</span>;
};

export default Number;
