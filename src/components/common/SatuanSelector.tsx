import type { Satuan } from '../../types';

interface SatuanSelectorProps {
  value?: string;
  onChange: (value: string) => void;
  satuans: Satuan[];
  disabled?: boolean;
  required?: boolean;
  label?: string;
  placeholder?: string;
  className?: string;
}

export default function SatuanSelector({
  value,
  onChange,
  satuans,
  disabled = false,
  required = false,
  label = 'Satuan',
  placeholder = 'Pilih satuan',
  className = '',
}: SatuanSelectorProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-sm font-semibold text-text-primary">
        {label}
        {required && <span className="text-accent-red ml-1">*</span>}
      </label>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required={required}
        className="w-full rounded-xl border border-surface bg-bg-card px-3 py-2.5 text-base text-text-primary shadow-sm shadow-slate-900/[0.03] transition-all duration-200 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
      >
        <option value="">{placeholder}</option>
        {satuans.map((satuan) => (
          <option key={satuan.id} value={satuan.nama}>
            {satuan.nama}
          </option>
        ))}
      </select>
    </div>
  );
}
