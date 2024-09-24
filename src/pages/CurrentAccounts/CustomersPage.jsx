import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import firestore from "../../firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

const CustomersPage = () => {
  const [individualCustomers, setIndividualCustomers] = useState([]);
  const [corporateCustomers, setCorporateCustomers] = useState([]);
  const [editCustomer, setEditCustomer] = useState(null);
  const [editCustomerType, setEditCustomerType] = useState("");
  const [individualFilter, setIndividualFilter] = useState("");
  const [corporateFilter, setCorporateFilter] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCustomerType, setNewCustomerType] = useState("individual");

  const { register, handleSubmit, setValue, reset } = useForm();

  const fetchCustomers = async () => {
    const individualSnapshot = await getDocs(
      collection(firestore, "individualCustomers")
    );
    const corporateSnapshot = await getDocs(
      collection(firestore, "corporateCustomers")
    );
    const individualList = individualSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    const corporateList = corporateSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setIndividualCustomers(individualList);
    setCorporateCustomers(corporateList);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const openEditModal = (customer) => {
    setEditCustomer(customer);
    setEditCustomerType(customer.type);
    setValue("name", customer.name || "");
    setValue("phone", customer.phone || "");
    setValue("tcNo", customer.tcNo || "");
    setValue("email", customer.email || "");
    setValue("address", customer.address || "");
    setValue("responsiblePerson", customer.responsiblePerson || "");
    setValue("commercialTitle", customer.commercialTitle || "");
    setValue("taxOffice", customer.taxOffice || "");
    setValue("taxNo", customer.taxNo || "");
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditCustomer(null);
    setEditCustomerType("");
    reset();
    setIsEditModalOpen(false);
  };

  const handleUpdate = async (data) => {
    try {
      if (editCustomerType === "individual") {
        const docRef = doc(firestore, "individualCustomers", editCustomer.id);
        await updateDoc(docRef, data);
      } else {
        const docRef = doc(firestore, "corporateCustomers", editCustomer.id);
        await updateDoc(docRef, data);
      }
      fetchCustomers();
      closeEditModal();
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  const handleDelete = async (id, type) => {
    try {
      if (type === "individual") {
        await deleteDoc(doc(firestore, "individualCustomers", id));
      } else {
        await deleteDoc(doc(firestore, "corporateCustomers", id));
      }
      fetchCustomers();
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  const openAddModal = () => {
    reset();
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    reset();
    setIsAddModalOpen(false);
  };

  const handleAdd = async (data) => {
    try {
      if (newCustomerType === "individual") {
        await addDoc(collection(firestore, "individualCustomers"), data);
      } else {
        await addDoc(collection(firestore, "corporateCustomers"), data);
      }
      fetchCustomers();
      closeAddModal();
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-xl mb-4">Müşteriler</h2>

      <button
        onClick={openAddModal}
        className="bg-blue-500 text-white p-2 rounded mb-4"
      >
        Müşteri Ekle
      </button>

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
                      Müşteri Türü:
                    </label>
                    <select
                      {...register("type")}
                      value={newCustomerType}
                      onChange={(e) => setNewCustomerType(e.target.value)}
                      className="w-full p-2 border rounded"
                      required
                    >
                      <option value="individual">Bireysel</option>
                      <option value="corporate">Kurumsal</option>
                    </select>
                  </div>

                  {newCustomerType === "individual" && (
                    <>
                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          İsim Soyad:
                        </label>
                        <input
                          {...register("name")}
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
                          TC No:
                        </label>
                        <input
                          {...register("tcNo")}
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
                    </>
                  )}

                  {newCustomerType === "corporate" && (
                    <>
                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          Sorumlu Kişi Ad Soyad:
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
                    </>
                  )}

                  <div className="flex items-center justify-between">
                    <button
                      type="submit"
                      className="bg-blue-500 text-white p-2 rounded"
                    >
                      Ekle
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && (
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
                  {editCustomerType === "individual" && (
                    <>
                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          İsim Soyad:
                        </label>
                        <input
                          {...register("name")}
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
                          TC No:
                        </label>
                        <input
                          {...register("tcNo")}
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
                    </>
                  )}

                  {editCustomerType === "corporate" && (
                    <>
                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          Sorumlu Kişi Ad Soyad:
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
                    </>
                  )}

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

      <div className="mt-8">
        <h3 className="text-lg mb-2">Bireysel Müşteriler</h3>
        <input
          type="text"
          placeholder="Bireysel Müşteri Ara..."
          className="mb-4 p-2 border rounded"
          value={individualFilter}
          onChange={(e) => setIndividualFilter(e.target.value)}
        />
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="border py-2">İsim Soyad</th>
              <th className="border py-2">Tel No</th>
              <th className="border py-2">TC No</th>
              <th className="border py-2">Mail</th>
              <th className="border py-2">Adres</th>
              <th className="border py-2">Düzenle</th>
              <th className="border py-2">Sil</th>
            </tr>
          </thead>
          <tbody>
            {individualCustomers
              .filter((customer) =>
                customer.name
                  .toLowerCase()
                  .includes(individualFilter.toLowerCase())
              )
              .map((customer) => (
                <tr key={customer.id}>
                  <td className="border p-2">{customer.name}</td>
                  <td className="border p-2">{customer.phone}</td>
                  <td className="border p-2">{customer.tcNo}</td>
                  <td className="border p-2">{customer.email}</td>
                  <td className="border p-2">{customer.address}</td>
                  <td className="border p-2">
                    <button
                      onClick={() =>
                        openEditModal({ ...customer, type: "individual" })
                      }
                      className="bg-yellow-500 text-white p-2 rounded"
                    >
                      Düzenle
                    </button>
                  </td>
                  <td className="border p-2">
                    <button
                      onClick={() => handleDelete(customer.id, "individual")}
                      className="bg-red-500 text-white p-2 rounded"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8">
        <h3 className="text-lg mb-2">Kurumsal Müşteriler</h3>
        <input
          type="text"
          placeholder="Kurumsal Müşteri Ara"
          className="mb-4 p-2 border rounded"
          value={corporateFilter}
          onChange={(e) => setCorporateFilter(e.target.value)}
        />
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="border p-2">Sorumlu Kişi</th>
              <th className="border p-2">Ticari Ünvan</th>
              <th className="border p-2">Tel No</th>
              <th className="border p-2">Mail</th>
              <th className="border p-2">Adres</th>
              <th className="border p-2">Vergi Dairesi</th>
              <th className="border p-2">Vergi No</th>
              <th className="border p-2">Düzenle</th>
              <th className="border p-2">Sil</th>
            </tr>
          </thead>
          <tbody>
            {corporateCustomers
              .filter((customer) =>
                customer.responsiblePerson
                  .toLowerCase()
                  .includes(corporateFilter.toLowerCase())
              )
              .map((customer) => (
                <tr key={customer.id}>
                  <td className="border p-2">{customer.responsiblePerson}</td>
                  <td className="border p-2">{customer.commercialTitle}</td>
                  <td className="border p-2">{customer.phone}</td>
                  <td className="border p-2">{customer.email}</td>
                  <td className="border p-2">{customer.address}</td>
                  <td className="border p-2">{customer.taxOffice}</td>
                  <td className="border p-2">{customer.taxNo}</td>
                  <td className="border p-2">
                    <button
                      onClick={() =>
                        openEditModal({ ...customer, type: "corporate" })
                      }
                      className="bg-yellow-500 text-white p-2 rounded"
                    >
                      Düzenle
                    </button>
                  </td>
                  <td className="border p-2">
                    <button
                      onClick={() => handleDelete(customer.id, "corporate")}
                      className="bg-red-500 text-white p-2 rounded"
                    >
                      Sil
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

export default CustomersPage;
