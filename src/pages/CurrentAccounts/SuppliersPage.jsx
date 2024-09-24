import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import firestore from "../../firebase";

const SuppliersPage = () => {
  const { register, handleSubmit, reset } = useForm();
  const [suppliers, setSuppliers] = useState([]);
  const [filter, setFilter] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editSupplier, setEditSupplier] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(firestore, "Suppliers"),
      (snapshot) => {
        const suppliersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSuppliers(suppliersData);
      }
    );

    return () => unsubscribe();
  }, [firestore]);

  const handleAdd = async (data) => {
    try {
      await addDoc(collection(firestore, "Suppliers"), data);
      reset();
      closeAddModal();
    } catch (error) {
      console.error("Error adding supplier: ", error);
    }
  };

  const handleUpdate = async (data) => {
    try {
      const supplierDoc = doc(firestore, "Suppliers", editSupplier.id);
      await updateDoc(supplierDoc, data);
      reset();
      closeEditModal();
    } catch (error) {
      console.error("Error updating supplier: ", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(firestore, "Suppliers", id));
    } catch (error) {
      console.error("Error deleting supplier: ", error);
    }
  };

  const openAddModal = () => {
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  const openEditModal = (supplier) => {
    setEditSupplier(supplier);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditSupplier(null);
  };

  const filteredSuppliers = suppliers.filter((supplier) => {
    const filterLower = filter.toLowerCase();
    return (
      supplier.responsiblePerson.toLowerCase().includes(filterLower) ||
      supplier.commercialTitle.toLowerCase().includes(filterLower) ||
      supplier.phone.toLowerCase().includes(filterLower) ||
      supplier.email.toLowerCase().includes(filterLower) ||
      supplier.address.toLowerCase().includes(filterLower) ||
      supplier.taxOffice.toLowerCase().includes(filterLower) ||
      supplier.taxNo.toLowerCase().includes(filterLower)
    );
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl mb-4">Tedarikçiler</h1>
      <button
        onClick={openAddModal}
        className="bg-blue-500 text-white p-2 rounded mb-4"
      >
        Tedarikçi Ekle
      </button>

      <input
        type="text"
        placeholder="Tedarikçi ara..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="mb-4 p-2 border rounded block "
      />

      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="py-2">Sorumlu Kişi</th>
            <th className="py-2">Ticari Ünvan</th>
            <th className="py-2">Tel No</th>
            <th className="py-2">Mail</th>
            <th className="py-2">Adres</th>
            <th className="py-2">Vergi Dairesi</th>
            <th className="py-2">Vergi No</th>
            <th className="py-2">İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {filteredSuppliers.map((supplier) => (
            <tr key={supplier.id}>
              <td className="py-2">{supplier.responsiblePerson}</td>
              <td className="py-2">{supplier.commercialTitle}</td>
              <td className="py-2">{supplier.phone}</td>
              <td className="py-2">{supplier.email}</td>
              <td className="py-2">{supplier.address}</td>
              <td className="py-2">{supplier.taxOffice}</td>
              <td className="py-2">{supplier.taxNo}</td>
              <td className="py-2">
                <button
                  onClick={() => openEditModal(supplier)}
                  className="bg-yellow-500 text-white p-2 rounded mr-2"
                >
                  Düzenle
                </button>
                <button
                  onClick={() => handleDelete(supplier.id)}
                  className="bg-red-500 text-white p-2 rounded"
                >
                  Sil
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isAddModalOpen && (
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
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white p-4">
                <button
                  onClick={closeAddModal}
                  className="float-right bg-red-500 text-white p-2 rounded"
                >
                  Kapat
                </button>
                <form onSubmit={handleSubmit(handleAdd)}>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Sorumlu Kişi:
                    </label>
                    <input
                      {...register("responsiblePerson")}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Ticari Ünvan:
                    </label>
                    <input
                      {...register("commercialTitle")}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Tel No:
                    </label>
                    <input
                      {...register("phone")}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Mail:
                    </label>
                    <input
                      {...register("email")}
                      type="email"
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Adres:
                    </label>
                    <textarea
                      {...register("address")}
                      className="w-full p-2 border rounded"
                      required
                    ></textarea>
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Vergi Dairesi:
                    </label>
                    <input
                      {...register("taxOffice")}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Vergi No:
                    </label>
                    <input
                      {...register("taxNo")}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <button
                      type="submit"
                      className="bg-blue-500 text-white p-2 rounded"
                    >
                      Kaydet
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && editSupplier && (
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
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white p-4">
                <button
                  onClick={closeEditModal}
                  className="float-right bg-red-500 text-white p-2 rounded"
                >
                  Kapat
                </button>
                <form onSubmit={handleSubmit(handleUpdate)}>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Sorumlu Kişi:
                    </label>
                    <input
                      {...register("responsiblePerson")}
                      className="w-full p-2 border rounded"
                      defaultValue={editSupplier.responsiblePerson}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Ticari Ünvan:
                    </label>
                    <input
                      {...register("commercialTitle")}
                      className="w-full p-2 border rounded"
                      defaultValue={editSupplier.commercialTitle}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Tel No:
                    </label>
                    <input
                      {...register("phone")}
                      className="w-full p-2 border rounded"
                      defaultValue={editSupplier.phone}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Mail:
                    </label>
                    <input
                      {...register("email")}
                      type="email"
                      className="w-full p-2 border rounded"
                      defaultValue={editSupplier.email}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Adres:
                    </label>
                    <textarea
                      {...register("address")}
                      className="w-full p-2 border rounded"
                      defaultValue={editSupplier.address}
                      required
                    ></textarea>
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Vergi Dairesi:
                    </label>
                    <input
                      {...register("taxOffice")}
                      className="w-full p-2 border rounded"
                      defaultValue={editSupplier.taxOffice}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Vergi No:
                    </label>
                    <input
                      {...register("taxNo")}
                      className="w-full p-2 border rounded"
                      defaultValue={editSupplier.taxNo}
                      required
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <button
                      type="submit"
                      className="bg-blue-500 text-white p-2 rounded"
                    >
                      Güncelle
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuppliersPage;
