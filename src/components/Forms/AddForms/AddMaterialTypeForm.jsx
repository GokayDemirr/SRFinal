import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  addDoc,
} from "firebase/firestore";
import firestore from "../../../firebase";
import ModalButton from "../../Buttons/ModalButton/ModalButton";

const AddMaterialTypeForm = ({ selectedClass }) => {
  const { register, handleSubmit, reset } = useForm();
  const [message, setMessage] = useState(""); // Combine success and error messages

  const onSubmit = async (data) => {
    const materialTypeName = data.newMaterialType;

    // Validate if input contains any uppercase letters
    if (/[A-Z]/.test(materialTypeName)) {
      setMessage("Malzeme cinsi sadece küçük harflerle yazılmalıdır.");
      return;
    }

    if (selectedClass && materialTypeName) {
      try {
        // Query MaterialClass collection to find the document with materialClassName equal to selectedClass
        const materialClassCollection = collection(firestore, "MaterialClass");
        const materialClassQuery = query(
          materialClassCollection,
          where("materialClassName", "==", selectedClass)
        );
        const materialClassSnapshot = await getDocs(materialClassQuery);

        if (!materialClassSnapshot.empty) {
          const materialClassDoc = materialClassSnapshot.docs[0]; // Assuming there is only one document with the selectedClass

          // Check if the material type already exists
          const materialTypeCollection = collection(
            firestore,
            "MaterialClass",
            materialClassDoc.id,
            "MaterialType"
          );
          const materialTypeQuery = query(
            materialTypeCollection,
            where("materialTypeName", "==", materialTypeName)
          );
          const materialTypeSnapshot = await getDocs(materialTypeQuery);

          if (!materialTypeSnapshot.empty) {
            setMessage("Eklenmek istenen malzeme cinsi zaten mevcut.");
            return;
          }

          // Count existing documents to generate the stock code
          const allTypesSnapshot = await getDocs(materialTypeCollection);
          const stockCode =
            allTypesSnapshot.docs.length + 1 < 10
              ? `0${allTypesSnapshot.docs.length + 1}`
              : `${allTypesSnapshot.docs.length + 1}`;

          // Add the new document with a generated ID
          const docRef = await addDoc(materialTypeCollection, {
            materialTypeName, // Store the lowercase material type name
            stockCode,
          });

          console.log("Added document with ID: ", docRef.id);

          // Set success message
          setMessage("Malzeme cinsi başarıyla eklenmiştir.");

          // Reset the form
          reset({ newMaterialType: "" });
        }
      } catch (err) {
        console.error("Error adding document: ", err);
        setMessage("Bir hata oluştu. Lütfen tekrar deneyin.");
      }
    }
  };

  return (
    <ModalButton buttonName="Malzeme Cinsi Ekle">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col items-center p-4"
      >
        <input
          type="text"
          className="mt-1 p-1 border rounded w-full"
          placeholder="Yeni Malzeme Cinsi"
          {...register("newMaterialType")}
        />
        <button
          type="submit"
          className="mt-2 px-3 py-2 bg-blue-500 text-white rounded"
        >
          Ekle
        </button>
        {message && (
          <p
            className={`mt-2 ${
              message.includes("başarıyla") ? "text-green-500" : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}
      </form>
    </ModalButton>
  );
};

export default AddMaterialTypeForm;
