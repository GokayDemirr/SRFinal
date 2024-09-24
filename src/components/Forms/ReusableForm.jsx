import { useForm } from "react-hook-form";

const ReusableForm = ({ fields, onSubmit }) => {
  const { register, handleSubmit } = useForm();

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-md"
    >
      <div className="flex flex-col space-y-4">
        {fields.map((field, index) => (
          <div key={index}>
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
            </label>
            {field.type === "select" ? (
              <select
                className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                {...register(field.name)}
                defaultValue=""
              >
                <option value="" disabled hidden>
                  {field.placeholder}
                </option>
                {field.options.map((option, index) => (
                  <option key={index} value={option.value}>
                    {option.value}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                {...register(field.name)}
                defaultValue={field.defaultValue}
                placeholder={field.placeholder}
              />
            )}
          </div>
        ))}
        <div>
          <input
            type="submit"
            className="mt-4 w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
          />
        </div>
      </div>
    </form>
  );
};

export default ReusableForm;
