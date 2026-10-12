import React from 'react';
import Modal from './Modal';

const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isConfirming = false,
  confirmVariant = 'danger',
}) => {
  const confirmButtonStyles = confirmVariant === 'danger'
    ? 'bg-rose-600 hover:bg-rose-700 focus-visible:ring-rose-500'
    : 'bg-indigo-600 hover:bg-indigo-700 focus-visible:ring-indigo-500';

  return (
    <Modal
      isOpen={isOpen}
      onClose={isConfirming ? () => {} : onClose}
      title={title}
    >
      <div className="space-y-6">
        <div className="text-sm leading-6 text-slate-600">{message}</div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isConfirming}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isConfirming}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${confirmButtonStyles}`}
          >
            {isConfirming ? 'Please wait...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationDialog;
