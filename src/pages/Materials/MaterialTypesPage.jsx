import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { collection, getDocs } from "firebase/firestore";
import AddMaterialTypeForm from "../../components/Forms/AddForms/AddMaterialTypeForm";
import MaterialTypeTable from "../../components/Tables/MaterialTypeTable";
import firestore from "../../firebase";

const MaterialTypesPage = () => {
  const { register, watch } = useForm();
  const [materialClasses, setMaterialClasses] = useState([]);
  const selectedClass = watch("materialClass", "");

  useEffect(() => {
    const fetchMaterialClasses = async () => {
      try {
        const querySnapshot = await getDocs(
          collection(firestore, "MaterialClass")
        );
        const materialClassData = querySnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((doc) => !doc.isPassive); // isPassive alanı false olan belgeleri filtreleyin
        setMaterialClasses(materialClassData);
      } catch (err) {
        console.error("Error getting documents: ", err);
      }
    };

    fetchMaterialClasses();
  }, []);

  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-col items-center">
        <label
          htmlFor="categories"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Lütfen işlem yapmak istediğiniz malzeme sınıfını seçiniz.
        </label>
        <select
          id="materialClass"
          name="materialClass"
          className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          {...register("materialClass")}
        >
          <option value="">Seçiniz</option>
          {materialClasses.map((item) => (
            <option key={item.id} value={item.materialClassName}>
              {item.materialClassName}
            </option>
          ))}
        </select>

        {selectedClass && <AddMaterialTypeForm selectedClass={selectedClass} />}

        <MaterialTypeTable selectedClass={selectedClass} />
      </div>
    </div>
  );
};

export default MaterialTypesPage;
