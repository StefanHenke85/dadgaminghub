export default function ConfirmModal({
  title,
  message,
  confirmText = 'Bestätigen',
  confirmColor = 'blue',
  onConfirm,
  onClose
}) {
  const colorClasses = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    red: 'bg-red-600 hover:bg-red-700',
    green: 'bg-green-600 hover:bg-green-700'
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-white mb-4">{title}</h3>

        <p className="text-gray-300 mb-6">{message}</p>

        <div className="flex space-x-3">
          <button
            onClick={onConfirm}
            className={`flex-1 ${colorClasses[confirmColor]} text-white font-medium py-2 px-4 rounded-lg transition-colors`}
          >
            {confirmText}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
}
