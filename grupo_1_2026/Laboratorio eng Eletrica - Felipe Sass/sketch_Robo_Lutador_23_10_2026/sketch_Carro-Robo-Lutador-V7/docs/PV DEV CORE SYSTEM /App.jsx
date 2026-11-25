import React, { useState } from 'react';
import ProtocoloSaudeMentalPage from './Page.jsx';

const fonts = {
  Arial: 'Arial, Helvetica, sans-serif',
  Calibri: 'Calibri, Candara, Segoe, sans-serif',
  Helvetica: 'Helvetica, Arial, sans-serif',
  Georgia: 'Georgia, serif',
};

export default function App() {
  const [selectedFont, setSelectedFont] = useState('Arial');

  return (
    <div style={{ fontFamily: fonts[selectedFont] }}>
      <ProtocoloSaudeMentalPage
        fonts={fonts}
        selectedFont={selectedFont}
        onFontChange={setSelectedFont}
      />
    </div>
  );
}
