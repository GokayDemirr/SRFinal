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

const MaterialTypeTable = ({ selectedClass }) => {
  const { register, watch } = useForm();
  const [materialTypes, setMaterialTypes] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [materialClassDocId, setMaterialClassDocId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (selectedClass) {
      const fetchMaterialTypes = async () => {
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

            const materialTypeCollection = collection(
              firestore,
              "MaterialClass",
              materialClassDoc.id,
              "MaterialType"
            );

            const unsubscribe = onSnapshot(
              materialTypeCollection,
              (snapshot) => {
                const materialTypeData = snapshot.docs.map((doc) => ({
                  id: doc.id,
                  stockCode: doc.data().stockCode,
                  materialTypeName: doc.data().materialTypeName || doc.id,
                  isPassive: doc.data().isPassive || false,
                }));
                materialTypeData.sort(
                  (a, b) => parseInt(a.stockCode) - parseInt(b.stockCode)
                );
                setMaterialTypes(materialTypeData);
                setFilteredData(materialTypeData);
              }
            );

            return () => unsubscribe();
          } else {
            console.log("No matching documents.");
          }
        } catch (err) {
          console.error("Error fetching material types: ", err);
        }
      };

      fetchMaterialTypes();
    } else {
      setMaterialTypes([]);
      setFilteredData([]);
    }
  }, [selectedClass]);

  useEffect(() => {
    const filterData = () => {
      const searchTerm = watch("searchTerm", "").toLowerCase();
      const filtered = materialTypes.filter((item) =>
        Object.values(item).some(
          (value) =>
            value && value.toString().toLowerCase().includes(searchTerm)
        )
      );
      setFilteredData(filtered);
    };

    filterData();
  }, [materialTypes, watch("searchTerm")]);

  const handlePassiveToggle = async (id, currentState) => {
    try {
      if (materialClassDocId) {
        const docRef = doc(
          firestore,
          "MaterialClass",
          materialClassDocId,
          "MaterialType",
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
      materialTypes.find((type) => type.id === id)?.materialTypeName || id
    );
    setError("");
    setSuccessMessage("");
    setShowModal(true);
  };

  const handleSaveClick = async () => {
    if (editId && editName) {
      if (editName !== editName.toLowerCase()) {
        setError("Malzeme tipinin tamamı küçük harfle yazılmalıdır.");
        return;
      }

      const nameExists = materialTypes.some(
        (type) =>
          type.id !== editId &&
          type.materialTypeName.toLowerCase() === editName.toLowerCase()
      );

      if (nameExists) {
        setError("Değiştirmek istediğiniz malzeme tipi halihazırda mevcut.");
        return;
      }

      try {
        const oldDocRef = doc(
          firestore,
          "MaterialClass",
          materialClassDocId,
          "MaterialType",
          editId
        );
        const newDocRef = doc(
          firestore,
          "MaterialClass",
          materialClassDocId,
          "MaterialType",
          editName
        );

        const oldDocSnapshot = await getDoc(oldDocRef);
        const oldData = oldDocSnapshot.data();
        if (oldData) {
          await setDoc(newDocRef, {
            ...oldData,
            materialTypeName: editName,
          });
          await deleteDoc(oldDocRef);
        }

        setEditId(null);
        setEditName("");
        setError("");
        setSuccessMessage("Başarıyla düzenlendi.");
        setShowModal(false);
      } catch (err) {
        console.error("Error renaming document: ", err);
      }
    }
  };

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
                placeholder="Yeni tip adı"
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
            <th className="w-1/3 px-4 py-2">Malzeme Tipi</th>
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
              <td className="border-b px-4 py-2">{item.materialTypeName}</td>
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

export default MaterialTypeTable;
