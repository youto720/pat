import { useState } from 'react';

// public/logo_po_01.png があればそれを表示し、無ければテキストで代用する。
// ロゴ画像を差し替えるときは public/ に置いて LOGO_SRC を変えるだけでよい。
const LOGO_SRC = '/logo_po_01.png';

interface Props {
  height?: number;
}

export function Logo({ height = 30 }: Props) {
  const [imgOk, setImgOk] = useState(true);

  if (imgOk) {
    return (
      <img
        src={LOGO_SRC}
        alt="Po"
        style={{ height: `${height}px`, width: 'auto', alignSelf: 'flex-start', display: 'block' }}
        onError={() => setImgOk(false)}
      />
    );
  }

  return (
    <span
      style={{
        fontFamily: "'Nunito', sans-serif",
        fontWeight: 900,
        fontSize: `${height * 0.95}px`,
        color: '#3a3d45',
        lineHeight: 1.2,
        display: 'block',
        whiteSpace: 'nowrap',
      }}
    >
      Po
    </span>
  );
}
