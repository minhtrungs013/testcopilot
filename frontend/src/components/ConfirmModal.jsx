import Modal from './Modal.jsx';

function ConfirmModal({ isOpen, title, message, confirmLabel = 'Confirm', onConfirm, onClose, busy = false }) {
  return (
    <Modal isOpen={isOpen} title={title} onClose={busy ? undefined : onClose}>
      <p className="text-sm text-gray-700">{message}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className="rounded-lg bg-red-600 px-3 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {confirmLabel}
        </button>
        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
}

export default ConfirmModal;
