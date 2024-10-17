import { useState } from "react";

const EditModalButton = ({ buttonName, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        {buttonName}
      </button>
      {isOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full">
              <div className="p-4">
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-black absolute top-2 right-2"
                >
                  X
                </button>
                {children}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditModalButton;
