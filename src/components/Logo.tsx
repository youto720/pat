import { useState } from 'react';

// public/logo.png があればそれを表示し、無ければ筆記体テキストで代用する。
// ロゴ画像を差し替えるときは public/logo.png を置くだけでよい。
interface Props {
  height?: number;
}

export function Logo({ height = 30 }: Props) {
  const [imgOk, setImgOk] = useState(true);

  if (imgOk) {
    return (
      <img
        src="/logo.png"
        alt="PoPo"
        style={{ height: `${height}px`, width: 'auto', alignSelf: 'flex-start', display: 'block' }}
        onError={() => setImgOk(false)}
      />
    );
  }

  return (
    <span
      style={{
        fontFamily: "'Pacifico', 'Nunito', cursive",
        fontSize: `${height * 0.95}px`,
        color: '#3a3d45',
        lineHeight: 1.2,
        display: 'block',
        whiteSpace: 'nowrap',
      }}
    >
      PoPo
    </span>
  );
}
