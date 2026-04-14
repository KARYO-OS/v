import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';

vi.mock('html5-qrcode', () => ({
  Html5QrcodeScanner: vi.fn().mockImplementation(() => ({
    render: vi.fn(),
    clear: vi.fn().mockResolvedValue(undefined),
  })),
}));

import { Html5QrcodeScanner } from 'html5-qrcode';
import QRScanner from '../../../components/guard/QRScanner';

describe('QRScanner', () => {
  it('renders scanner placeholder and initializes scanner', () => {
    const onScan = vi.fn();
    const { container } = render(<QRScanner onScan={onScan} />);

    expect(container.querySelector('#qr-guard-scanner')).toBeInTheDocument();
    expect(Html5QrcodeScanner).toHaveBeenCalledWith('qr-guard-scanner', { fps: 10, qrbox: 250 }, false);
    const scannerInstance = (Html5QrcodeScanner as unknown as { mock: { results: Array<{ value: { render: ReturnType<typeof vi.fn> } }> } }).mock.results[0].value;
    expect(scannerInstance.render).toHaveBeenCalled();
  });
});
