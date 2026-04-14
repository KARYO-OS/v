import QRCode from 'react-qr-code';

interface Props {
  qrToken: string;
}

const GatePassQRCode: React.FC<Props> = ({ qrToken }) => (
  <div className="flex flex-col items-center">
    <QRCode value={qrToken} size={128} />
    <div className="text-xs mt-2">Tunjukkan QR ini ke pos jaga</div>
  </div>
);
export default GatePassQRCode;
