/**
 * Toast display component
 * Renders all active toasts
 */

import { useToastStore } from '../../lib/toastNotification';
import Button from './Button';

interface ToastItemProps {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  onClose: (id: string) => void;
}

function ToastItem({ id, type, message, description, action, onClose }: ToastItemProps) {
  const bgClass = {
    success: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
    error: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
    info: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
  }[type];

  const textClass = {
    success: 'text-green-900 dark:text-green-100',
    error: 'text-red-900 dark:text-red-100',
    info: 'text-blue-900 dark:text-blue-100',
    warning: 'text-yellow-900 dark:text-yellow-100',
  }[type];

  const iconClass = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
  }[type];

  const iconBgClass = {
    success: 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-100',
    error: 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-100',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-100',
    warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-100',
  }[type];

  return (
    <div
      className={`animate-in slide-in-from-right border rounded-lg p-4 shadow-lg ${bgClass} ${textClass} flex gap-3 items-start`}
      role="alert"
    >
      {/* Icon */}
      <div className={`flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full font-bold text-sm ${iconBgClass}`}>
        {iconClass}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">{message}</p>
        {description && <p className="text-xs mt-1 opacity-80">{description}</p>}
      </div>

      {/* Action or Close */}
      <div className="flex gap-2 flex-shrink-0 items-center">
        {action && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              action.onClick();
              onClose(id);
            }}
            className="text-xs"
          >
            {action.label}
          </Button>
        )}
        <button
          onClick={() => onClose(id)}
          className="opacity-50 hover:opacity-100 transition p-1"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-20 right-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3 pointer-events-none sm:bottom-4">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem
            id={toast.id}
            type={toast.type}
            message={toast.message}
            description={toast.description}
            action={toast.action}
            onClose={removeToast}
          />
        </div>
      ))}
    </div>
  );
}
