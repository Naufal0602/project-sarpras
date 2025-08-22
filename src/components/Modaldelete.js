import React from "react";

const ConfirmModal = ({ open, onClose, onConfirm, title = "Konfirmasi", message = "Yakin ingin menghapus data ini?" }) => {
  if (!open) return null; 

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-80">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        <p className="mb-4 text-sm text-gray-600">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border hover:bg-gray-100"
          >
            Tidak
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
          >
            Iya
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
