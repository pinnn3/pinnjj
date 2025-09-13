import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-4 transform transition-transform duration-300 scale-95"
        onClick={(e) => e.stopPropagation()}
        style={isOpen ? { transform: 'scale(1)', opacity: 1 } : { transform: 'scale(0.95)', opacity: 0 }}
      >
        {children}
        <button
          onClick={onClose}
          className="mt-6 bg-[#f687b3] text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-[#f687b3]/80 transition-colors duration-200 w-full"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Modal;
