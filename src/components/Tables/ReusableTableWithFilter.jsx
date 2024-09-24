import React from "react";
import { useForm } from "react-hook-form";

const ReusableTableWithFilter = ({ data, filterFields }) => {
  const { register, watch } = useForm();

  const watchedFields = filterFields.reduce((acc, field) => {
    acc[field.name] = watch(field.name, "");
    return acc;
  }, {});

  const filteredData = data.filter((item) =>
    filterFields.every((field) =>
      item[field.name]
        .toLowerCase()
        .includes(watchedFields[field.name].toLowerCase())
    )
  );

  return (
    <div className="container mx-auto p-4">
      <div className="overflow-x-auto">
        <form>
          <table className="min-w-full bg-white">
            <thead className="bg-gray-800 text-white">
              <tr>
                {filterFields.map((field) => (
                  <th key={field.name} className="w-1/2 px-4 py-2">
                    <div className="flex flex-col">
                      <span>{field.label}</span>
                      <input
                        type="text"
                        className="mt-1 p-1 border rounded"
                        placeholder="Ara..."
                        {...register(field.name)}
                      />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr key={index} className="bg-gray-100">
                  {filterFields.map((field) => (
                    <td key={field.name} className="border px-4 py-2">
                      {item[field.name]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </form>
      </div>
    </div>
  );
};

export default ReusableTableWithFilter;
