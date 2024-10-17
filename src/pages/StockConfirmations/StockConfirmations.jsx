import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  getDoc,
  query,
  where,
} from "firebase/firestore";
import firestore from "../../firebase";

const StockConfirmations = () => {
  const [stockOperations, setStockOperations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalMessage, setModalMessage] = useState(null);

  useEffect(() => {
    const fetchStockOperations = async () => {
      try {
        const querySnapshot = await getDocs(
          collection(firestore, "StockOperations")
        );
        const operations = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setStockOperations(operations);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching stock operations: ", error);
        setError("Stok işlemleri getirilirken bir hata oluştu.");
        setLoading(false);
      }
    };

    fetchStockOperations();
  }, []);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const handleApprove = async (operation) => {
    try {
      // Materials koleksiyonunda stockCode ile sorgu yap
      const materialsRef = collection(firestore, "Material");
      const q = query(
        materialsRef,
        where("stockCode", "==", operation.stockCode)
      );
      const materialSnapshot = await getDocs(q);

      if (!materialSnapshot.empty) {
        const materialDoc = materialSnapshot.docs[0]; // Eşleşen ilk belgeyi al
        const currentAmount = materialDoc.data().amount || 0;
        const updatedAmount =
          operation.operationType === "in"
            ? currentAmount + operation.quantity // Miktarı artır
            : currentAmount - operation.quantity; // Miktarı azalt

        // Güncellenen miktarın negatif olup olmadığını kontrol et
        if (updatedAmount < 0) {
          setModalMessage(
            "Stok miktarı 0'ın altına düşemez. Bu işlem onaylanamaz."
          );
          return;
        }

        // Eğer stok miktarı geçerliyse amount'u güncelle
        await updateDoc(doc(firestore, "Material", materialDoc.id), {
          amount: updatedAmount,
        });
      } else {
        console.log("Eşleşen malzeme bulunamadı.");
      }

      // İşlem onaylandıktan sonra dokümanı sil
      await deleteDoc(doc(firestore, "StockOperations", operation.id));

      // Ekrandan kaldır
      setStockOperations((prevOperations) =>
        prevOperations.filter((op) => op.id !== operation.id)
      );

      // Modal ile onay mesajı göster
      setModalMessage("İşlem onaylanmıştır.");
    } catch (error) {
      console.error("Error approving stock operation: ", error);
      setModalMessage("İşlem sırasında bir hata oluştu.");
    }
  };

  const handleReject = async (operation) => {
    try {
      // İşlemi reddetmek sadece dokümanı siler
      await deleteDoc(doc(firestore, "StockOperations", operation.id));

      // Ekrandan kaldır
      setStockOperations((prevOperations) =>
        prevOperations.filter((op) => op.id !== operation.id)
      );

      // Modal ile ret mesajı göster
      setModalMessage("İşlem reddedilmiştir.");
    } catch (error) {
      console.error("Error rejecting stock operation: ", error);
      setModalMessage("İşlem sırasında bir hata oluştu.");
    }
  };

  const closeModal = () => {
    setModalMessage(null); // Modal'ı kapatır
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Stok İşlem Onayları</h1>
      {loading ? (
        <p>Yükleniyor...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <table className="min-w-full bg-white">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-4 py-2">Stok Kodu</th>
              <th className="px-4 py-2">İşlem Türü</th>
              <th className="px-4 py-2">Miktar</th>
              <th className="px-4 py-2">Zaman Damgası</th>
              <th className="px-4 py-2">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {stockOperations.map((operation) => (
              <tr key={operation.id} className="bg-gray-100">
                <td className="border px-4 py-2">{operation.stockCode}</td>
                <td className="border px-4 py-2">
                  {operation.operationType === "in"
                    ? "Stok Girişi"
                    : "Stok Çıkışı"}
                </td>
                <td className="border px-4 py-2">{operation.quantity}</td>
                <td className="border px-4 py-2">
                  {formatTimestamp(operation.timestamp)}
                </td>
                <td className="border px-4 py-2">
                  <button
                    onClick={() => handleApprove(operation)}
                    className="bg-green-500 text-white px-4 py-2 rounded mr-2"
                  >
                    Onayla
                  </button>
                  <button
                    onClick={() => handleReject(operation)}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                  >
                    Reddet
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modalMessage && <Modal message={modalMessage} closeModal={closeModal} />}
    </div>
  );
};

// Modal bileşeni burada tanımlandı
const Modal = ({ message, closeModal }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-lg text-center">
        <p>{message}</p>
        <button
          className="bg-blue-500 text-white px-4 py-2 mt-4 rounded"
          onClick={closeModal}
        >
          Kapat
        </button>
      </div>
    </div>
  );
};

export default StockConfirmations;
