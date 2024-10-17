const Modal = ({ isOpen, onClose, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-lg w-1/3">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <p>{message}</p>
        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
