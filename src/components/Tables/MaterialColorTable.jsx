import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import firestore from "../../firebase";

const MaterialColorTable = ({ selectedClass }) => {
  const { register, watch } = useForm();
  const [materialColors, setMaterialColors] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [materialClassDocId, setMaterialClassDocId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState(""); // For storing error messages
  const [successMessage, setSuccessMessage] = useState(""); // For success message
  const [showModal, setShowModal] = useState(false); // To toggle modal visibility

  useEffect(() => {
    if (selectedClass) {
      const fetchMaterialColors = async () => {
        try {
          const materialClassCollection = collection(
            firestore,
            "MaterialClass"
          );
          const materialClassQuery = query(
            materialClassCollection,
            where("materialClassName", "==", selectedClass)
          );
          const materialClassSnapshot = await getDocs(materialClassQuery);

          if (!materialClassSnapshot.empty) {
            const materialClassDoc = materialClassSnapshot.docs[0];
            setMaterialClassDocId(materialClassDoc.id);

            const materialColorCollection = collection(
              firestore,
              "MaterialClass",
              materialClassDoc.id,
              "MaterialColor"
            );

            const unsubscribe = onSnapshot(
              materialColorCollection,
              (snapshot) => {
                const materialColorData = snapshot.docs.map((doc) => ({
                  id: doc.id,
                  stockCode: doc.data().stockCode,
                  materialColorName: doc.data().materialColorName || doc.id, // Fallback to id if materialColorName is not present
                  isPassive: doc.data().isPassive || false,
                }));
                materialColorData.sort(
                  (a, b) => parseInt(a.stockCode) - parseInt(b.stockCode)
                );
                setMaterialColors(materialColorData);
                setFilteredData(materialColorData);
              }
            );

            return () => unsubscribe();
          } else {
            console.log("No matching documents.");
          }
        } catch (err) {
          console.error("Error fetching material colors: ", err);
        }
      };

      fetchMaterialColors();
    } else {
      setMaterialColors([]);
      setFilteredData([]);
    }
  }, [selectedClass]);

  useEffect(() => {
    const filterData = () => {
      const searchTerm = watch("searchTerm", "").toLowerCase();
      const filtered = materialColors.filter((item) =>
        Object.values(item).some(
          (value) =>
            value && value.toString().toLowerCase().includes(searchTerm)
        )
      );
      setFilteredData(filtered);
    };

    filterData();
  }, [materialColors, watch("searchTerm")]);

  const handlePassiveToggle = async (id, currentState) => {
    try {
      if (materialClassDocId) {
        const docRef = doc(
          firestore,
          "MaterialClass",
          materialClassDocId,
          "MaterialColor",
          id
        );
        await updateDoc(docRef, {
          isPassive: !currentState,
        });
      }
    } catch (err) {
      console.error("Error updating document: ", err);
    }
  };

  const handleEditClick = (id) => {
    setEditId(id);
    setEditName(
      materialColors.find((color) => color.id === id)?.materialColorName || id
    );
    setError(""); // Clear any previous errors
    setSuccessMessage(""); // Clear any previous success messages
    setShowModal(true); // Show the modal for editing
  };

  const handleSaveClick = async () => {
    if (editId && editName) {
      // Check if new name is in lowercase
      if (editName !== editName.toLowerCase()) {
        setError("Malzeme renginin tamamı küçük harfle yazılmalıdır.");
        return;
      }

      // Check if new name already exists
      const nameExists = materialColors.some(
        (color) =>
          color.id !== editId &&
          color.materialColorName.toLowerCase() === editName.toLowerCase()
      );

      if (nameExists) {
        setError("Değiştirmek istediğiniz renk halihazırda mevcut.");
        return;
      }

      try {
        const oldDocRef = doc(
          firestore,
          "MaterialClass",
          materialClassDocId,
          "MaterialColor",
          editId
        );
        const newDocRef = doc(
          firestore,
          "MaterialClass",
          materialClassDocId,
          "MaterialColor",
          editName
        );

        const oldDocSnapshot = await getDoc(oldDocRef);
        const oldData = oldDocSnapshot.data();
        if (oldData) {
          await setDoc(newDocRef, {
            ...oldData,
            materialColorName: editName, // Update with new name
          });
          await deleteDoc(oldDocRef);
        }

        setEditId(null);
        setEditName("");
        setError(""); // Clear error after successful save
        setSuccessMessage("Başarıyla düzenlendi.");
        setShowModal(false); // Hide the modal
      } catch (err) {
        console.error("Error renaming document: ", err);
      }
    }
  };

  // Handle form submission with Enter key
  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSaveClick();
  };

  return (
    <div className="overflow-x-auto mt-4">
      <form>
        <input
          type="text"
          className="mt-1 p-2 border rounded"
          placeholder="Ara..."
          {...register("searchTerm")}
        />
      </form>

      {showModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white p-4 rounded shadow-lg">
            <h2 className="text-lg font-bold mb-4">Düzenle</h2>
            <form onSubmit={handleFormSubmit}>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="border rounded p-2 mb-4"
                placeholder="Yeni renk adı"
              />
              {error && <p className="text-red-500 mb-4">{error}</p>}
              {successMessage && (
                <p className="text-green-500 mb-4">{successMessage}</p>
              )}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-green-500 text-white p-2 rounded mr-2"
                >
                  Kaydet
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-500 text-white p-2 rounded"
                >
                  Kapat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <table className="min-w-full bg-white mt-4 border border-gray-200">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="w-1/3 px-4 py-2">Stok Kodu</th>
            <th className="w-1/3 px-4 py-2">Malzeme Rengi</th>
            <th className="w-1/3 px-4 py-2">İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item) => (
            <tr
              key={item.id}
              className={`hover:bg-gray-100 ${
                item.isPassive ? "bg-gray-300 text-gray-600" : ""
              }`}
            >
              <td className="border-b px-4 py-2">{item.stockCode}</td>
              <td className="border-b px-4 py-2">{item.materialColorName}</td>
              <td className="border-b px-4 py-2 flex">
                <button
                  onClick={() => handleEditClick(item.id)}
                  className="p-1 border rounded bg-blue-500 text-white mr-2"
                >
                  Düzenle
                </button>
                <button
                  onClick={() => handlePassiveToggle(item.id, item.isPassive)}
                  className={`p-1 border rounded ${
                    item.isPassive
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {item.isPassive ? "Aktifleştir" : "Pasifleştir"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MaterialColorTable;
