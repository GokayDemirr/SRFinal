import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import firestore from "../../firebase";

const MaterialClassTable = () => {
  const { register, watch } = useForm();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(firestore, "MaterialClass"),
      (snapshot) => {
        const materialClass = snapshot.docs.map((docSnap) => {
          const { stockCode, materialClassName, isPassive } = docSnap.data();
          return {
            id: docSnap.id,
            stockCode,
            materialClassName: materialClassName || "",
            isPassive: isPassive || false,
          };
        });

        materialClass.sort((a, b) =>
          a.stockCode.localeCompare(b.stockCode, undefined, { numeric: true })
        );

        setData(materialClass);
        setFilteredData(materialClass);
      },
      (error) => {
        console.error("Error getting documents: ", error);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const filterData = () => {
      const searchTerm = watch("searchTerm", "").toLowerCase();

      const filtered = data.filter((item) =>
        Object.values(item).some(
          (value) =>
            value && value.toString().toLowerCase().includes(searchTerm)
        )
      );

      setFilteredData(filtered);
    };

    filterData();
  }, [data, watch("searchTerm")]);

  const handleEdit = (id, value) => {
    setEditId(id);
    setEditValue(value);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const docRef = doc(firestore, "MaterialClass", editId);
      await updateDoc(docRef, {
        materialClassName: editValue,
      });
      setEditId(null);
      setEditValue("");
    } catch (err) {
      console.error("Error updating document: ", err);
    }
  };

  const handlePassive = async (materialClassName, isPassive) => {
    try {
      const q = query(
        collection(firestore, "MaterialClass"),
        where("materialClassName", "==", materialClassName)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, {
          isPassive: !isPassive,
        });
      }
    } catch (err) {
      console.error("Error updating document: ", err);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="overflow-x-auto">
        <form>
          <input
            type="text"
            className="mt-1 p-2 border rounded"
            placeholder="Ara..."
            {...register("searchTerm")}
          />
        </form>
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="w-1/4 px-4 py-2 border-b">Stok Kodu</th>
              <th className="w-1/4 px-4 py-2 border-b">Malzeme Sınıfı</th>
              <th className="w-1/4 px-4 py-2 border-b">Durum</th>
              <th className="w-1/4 px-4 py-2 border-b">İşlemler</th>
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
                <td className="border-b px-4 py-2">
                  {editId === item.id ? (
                    <form onSubmit={handleEditSubmit} className="inline-block">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="border rounded p-1"
                      />
                      <button
                        type="submit"
                        className="ml-2 p-1 border rounded bg-green-500 text-white"
                      >
                        Kaydet
                      </button>
                    </form>
                  ) : (
                    item.materialClassName
                  )}
                </td>
                <td className="border-b px-4 py-2">
                  {item.isPassive ? "Pasif" : "Aktif"}
                </td>
                <td className="border-b px-4 py-2">
                  <button
                    onClick={() =>
                      handlePassive(item.materialClassName, item.isPassive)
                    }
                    className={`mr-2 p-1 border rounded ${
                      item.isPassive
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {item.isPassive ? "Aktifleştir" : "Pasifleştir"}
                  </button>
                  <button
                    onClick={() => handleEdit(item.id, item.materialClassName)}
                    className="p-1 border rounded bg-blue-500 text-white"
                  >
                    Düzenle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MaterialClassTable;
