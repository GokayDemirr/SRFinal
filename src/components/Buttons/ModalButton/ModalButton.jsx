import { useState } from "react";

const ModalButton = ({ children, buttonName }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-white bg-blue-700 hover:bg-blue-800  font-medium rounded-lg text-sm px-2 w-40 h-12"
      >
        {buttonName}
      </button>

      {isOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              ​
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative">
              {children}
              <button
                onClick={() => setIsOpen(false)}
                className="text-white bg-red-500 hover:bg-red-600  font-medium rounded-lg text-sm px-2 w-6 h-6 absolute top-0 right-0 m-2"
              >
                X
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ModalButton;
