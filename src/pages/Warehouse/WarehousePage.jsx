import React, { useEffect, useState } from "react";
import { collection, getDocs, addDoc } from "firebase/firestore";
import firestore from "../../firebase";
import WarehouseMaterialTable from "../../components/Tables/WarehouseMaterialTable";

const WarehousePage = () => {
  const [shelfColumnCount, setShelfColumnCount] = useState(0);
  const [newShelfColumnCount, setNewShelfColumnCount] = useState(1);
  const [successMessage, setSuccessMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [stockCount, setStockCount] = useState(0);
  const [stockOperation, setStockOperation] = useState("");
  const [stockDate, setStockDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // For error handling

  useEffect(() => {
    const fetchShelfColumnCount = async () => {
      const querySnapshot = await getDocs(
        collection(firestore, "ShelfColumns")
      );
      setShelfColumnCount(querySnapshot.size);
    };

    fetchShelfColumnCount();
  }, []);

  const openStockModal = (material) => {
    setSelectedMaterial(material);
    setStockModalOpen(true);
  };

  const closeStockModal = () => {
    setStockModalOpen(false);
    setStockCount(0);
    setStockOperation("");
    setErrorMessage(""); // Clear errors when closing modal
  };

  const handleStockOperation = async () => {
    // Validation
    if (!stockOperation) {
      setErrorMessage("İşlem türü seçmek zorunludur.");
      return;
    }
    if (stockCount <= 0) {
      setErrorMessage("Miktar 0'dan büyük olmalıdır.");
      return;
    }

    try {
      await addDoc(collection(firestore, "StockOperations"), {
        stockCode: selectedMaterial.stockCode,
        operationType: stockOperation,
        quantity: stockCount,
        date: stockDate,
        timestamp: new Date(),
      });

      setSuccessMessage("Stok işlemi başarılı!");
      setSuccessModalOpen(true);
      closeStockModal();
    } catch (error) {
      console.error("Error saving stock operation: ", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold mb-4">Depo Yönetimi</h1>
        <div>
          <p className="mb-4">
            Güncel raf no sütunu sayısı: {shelfColumnCount}
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 mb-2 rounded"
          >
            Yeni Raf Sütunu Ekle
          </button>
        </div>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white p-6 rounded shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">Yeni Raf Sütunu Ekle</h2>
            <p className="mb-4">
              Güncel raf no sütunu sayısı: {shelfColumnCount}
            </p>
            <label htmlFor="shelfColumnCount">
              Eklemek istediğiniz sütun sayısı:
            </label>
            <input
              type="number"
              id="shelfColumnCount"
              value={newShelfColumnCount}
              onChange={(e) => setNewShelfColumnCount(parseInt(e.target.value))}
              className="border border-gray-300 rounded px-4 py-2 mb-4 w-full"
            />
            {successMessage && (
              <p className="text-green-500 mb-4">{successMessage}</p>
            )}
            <button
              onClick={async () => {
                try {
                  for (let i = 0; i < newShelfColumnCount; i++) {
                    await addDoc(collection(firestore, "ShelfColumns"), {
                      ShelfColumnNo: shelfColumnCount + i + 1,
                    });
                  }
                  setShelfColumnCount(shelfColumnCount + newShelfColumnCount);
                  setSuccessMessage(
                    `${newShelfColumnCount} raf sütunu başarıyla eklenmiştir.`
                  );
                } catch (error) {
                  console.error("Error adding shelf column: ", error);
                }
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Ekle
            </button>
            <button
              onClick={() => setModalOpen(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded ml-2"
            >
              Bitir
            </button>
          </div>
        </div>
      )}

      <WarehouseMaterialTable onOpenStockModal={openStockModal} />

      {stockModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={closeStockModal}
        >
          <div
            className="bg-white p-6 rounded shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">Stok İşlemi</h2>
            {errorMessage && (
              <p className="text-red-500 mb-4">{errorMessage}</p>
            )}
            <div className="mb-4">
              <label htmlFor="stockOperation" className="block mb-2">
                İşlem Türü:
              </label>
              <select
                id="stockOperation"
                value={stockOperation}
                onChange={(e) => setStockOperation(e.target.value)}
                className="border border-gray-300 rounded px-4 py-2 w-full"
              >
                <option value="">Seçiniz</option>
                <option value="in">Stok Girişi</option>
                <option value="out">Stok Çıkışı</option>
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor="stockCount" className="block mb-2">
                Miktar:
              </label>
              <input
                type="number"
                id="stockCount"
                value={stockCount}
                onChange={(e) => setStockCount(parseInt(e.target.value))}
                className="border border-gray-300 rounded px-4 py-2 w-full"
                min="1"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="stockDate" className="block mb-2">
                Tarih:
              </label>
              <input
                type="date"
                id="stockDate"
                value={stockDate}
                onChange={(e) => setStockDate(e.target.value)}
                className="border border-gray-300 rounded px-4 py-2 w-full"
              />
            </div>
            <button
              onClick={handleStockOperation}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Kaydet
            </button>
            <button
              onClick={closeStockModal}
              className="bg-gray-500 text-white px-4 py-2 rounded ml-2"
            >
              İptal
            </button>
          </div>
        </div>
      )}

      {successModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setSuccessModalOpen(false)}
        >
          <div
            className="bg-white p-6 rounded shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">Başarı</h2>
            <p>{successMessage}</p>
            <button
              onClick={() => setSuccessModalOpen(false)}
              className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
            >
              Tamam
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehousePage;
