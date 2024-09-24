import { useState } from "react";
import { addDoc, getDocs, collection, query, where } from "firebase/firestore";
import firestore from "../../../firebase";

const AddMaterialClassForm = () => {
  const [materialClassName, setMaterialClassName] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setMaterialClassName(e.target.value);
  };

  const onSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission

    // Reset message and set submitting state
    setIsSubmitting(true);
    setMessage("");

    // Validate if input is in lowercase
    if (materialClassName !== materialClassName.toLowerCase()) {
      setMessage("Malzeme sınıfı küçük harflerle yazılmalıdır.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Check if the material class name already exists
      const q = query(
        collection(firestore, "MaterialClass"),
        where("materialClassName", "==", materialClassName)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setMessage("Bu malzeme sınıfı zaten mevcut.");
        return;
      }

      // Get the total number of documents
      const querySnapshotAll = await getDocs(
        collection(firestore, "MaterialClass")
      );
      const docCount = querySnapshotAll.size;

      // Generate the new stockCode
      const newStockCode =
        docCount + 1 < 10 ? `0${docCount + 1}` : `${docCount + 1}`;

      // Add the document with Firebase-generated ID
      await addDoc(collection(firestore, "MaterialClass"), {
        materialClassName,
        stockCode: newStockCode,
      });

      setMessage("Malzeme sınıfı başarıyla oluşturuldu.");
      setMaterialClassName(""); // Clear the input field
    } catch (err) {
      console.error("Error adding document: ", err);
      setMessage("Hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine the color based on the message content
  const messageColor = message.includes("başarıyla") ? "green" : "red";

  return (
    <div className="p-4">
      <form onSubmit={onSubmit} className="flex flex-col items-center">
        <label className="block text-sm font-medium text-gray-700">
          Malzeme Sınıfı
        </label>
        <input
          type="text"
          value={materialClassName}
          onChange={handleChange}
          placeholder="Malzeme Sınıfı Giriniz..."
          className="mt-1 p-1 border rounded w-full"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className={`mt-2 px-3 py-2 rounded ${
            isSubmitting ? "bg-gray-400" : "bg-blue-500"
          } text-white`}
        >
          {isSubmitting ? "Yükleniyor..." : "Ekle"}
        </button>
      </form>
      {message && (
        <p style={{ color: messageColor, marginTop: "8px" }}>{message}</p>
      )}
    </div>
  );
};

export default AddMaterialClassForm;
