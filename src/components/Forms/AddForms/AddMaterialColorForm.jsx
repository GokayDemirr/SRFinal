import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import firestore from "../../../firebase";
import ModalButton from "../../Buttons/ModalButton/ModalButton";

const AddMaterialColorForm = ({ selectedClass }) => {
  const { register, handleSubmit, reset } = useForm();
  const [message, setMessage] = useState(""); // Combine success and error messages

  const onSubmit = async (data) => {
    const materialColorName = data.newMaterialColor;

    // Validate if input contains any uppercase letters
    if (/[A-Z]/.test(materialColorName)) {
      setMessage("Malzeme rengi sadece küçük harflerle yazılmalıdır.");
      return;
    }

    if (selectedClass && materialColorName) {
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

          // Check if the material color already exists
          const materialColorCollection = collection(
            firestore,
            "MaterialClass",
            materialClassDoc.id,
            "MaterialColor"
          );
          const materialColorQuery = query(
            materialColorCollection,
            where("materialColorName", "==", materialColorName)
          );
          const materialColorSnapshot = await getDocs(materialColorQuery);

          if (!materialColorSnapshot.empty) {
            setMessage("Eklenmek istenen malzeme rengi zaten mevcut.");
            return;
          }

          // Count existing documents to generate the stock code
          const allColorsSnapshot = await getDocs(materialColorCollection);
          const stockCode =
            allColorsSnapshot.docs.length + 1 < 10
              ? `0${allColorsSnapshot.docs.length + 1}`
              : `${allColorsSnapshot.docs.length + 1}`;

          // Create a new document reference with a random ID
          const newDocRef = doc(
            collection(
              firestore,
              "MaterialClass",
              materialClassDoc.id,
              "MaterialColor"
            )
          );

          // Set document with the new ID and the provided data
          await setDoc(newDocRef, {
            stockCode,
            materialColorName, // Store the lowercase color name
          });

          // Set success message
          setMessage("Malzeme rengi başarıyla eklenmiştir.");

          // Reset the form
          reset({ newMaterialColor: "" });
        }
      } catch (err) {
        console.error("Error adding document: ", err);
        setMessage("Bir hata oluştu. Lütfen tekrar deneyin.");
      }
    }
  };

  return (
    <ModalButton buttonName="Malzeme Rengi Ekle">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col items-center p-4"
      >
        <input
          type="text"
          className="mt-1 p-1 border rounded w-full"
          placeholder="Yeni Malzeme Rengi"
          {...register("newMaterialColor")}
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

export default AddMaterialColorForm;
