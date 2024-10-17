import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { collection, getDocs, onSnapshot } from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import firestore from "../../firebase";

const WarehouseMaterialTable = ({ onOpenStockModal }) => {
  const { register, watch } = useForm();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [loadingImages, setLoadingImages] = useState(true);

  useEffect(() => {
    const getDataFromFirestore = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, "Material"));
        const materialData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("Fetched Data: ", materialData);
        setData(materialData);
        setFilteredData(materialData);

        const urls = {};
        await Promise.all(
          materialData.map(async (material) => {
            if (material.imageUrl) {
              try {
                const url = await getDownloadURL(
                  ref(getStorage(), material.imageUrl)
                );
                urls[material.id] = url;
              } catch (error) {
                console.error("Error fetching image URL:", error);
              }
            }
          })
        );
        setImageUrls(urls);
        setLoadingImages(false);
      } catch (err) {
        console.error("Error getting documents: ", err);
      }
    };

    getDataFromFirestore();
  }, []);

  useEffect(() => {
    const filterData = () => {
      const searchTerm = watch("searchTerm", "").toLowerCase();

      const filtered = data.filter((item) => {
        const combinedShelf =
          `${item.shelfRowNo}${item.shelfColumnNo}`.toLowerCase();

        return (
          Object.values(item).some(
            (value) =>
              value && value.toString().toLowerCase().includes(searchTerm)
          ) || combinedShelf.includes(searchTerm)
        );
      });

      setFilteredData(filtered);
    };

    filterData();

    const unsubscribe = onSnapshot(collection(firestore, "Material"), () => {
      filterData();
    });

    return () => unsubscribe();
  }, [data, watch("searchTerm")]);

  const openImageModal = async (materialId) => {
    try {
      const url = await getDownloadURL(
        ref(
          getStorage(),
          data.find((material) => material.id === materialId).imageUrl
        )
      );
      setSelectedImageUrl(url);
    } catch (error) {
      console.error("Error fetching image URL for modal:", error);
    }
  };

  const closeImageModal = () => {
    setSelectedImageUrl(null);
  };

  const handleModalClick = (e) => {
    if (e.target === e.currentTarget) {
      closeImageModal();
    }
  };

  const handleRequestClick = (material) => {
    const subject = encodeURIComponent("PC Kayıt Numarası Talebi");
    const body = encodeURIComponent(`
      Merhaba Serdar Bey,
  
      Aşağıdaki malzeme için PC kayıt numarası talep ediyorum:
  
      Malzeme Sınıfı: ${material.materialClassName}
      Malzeme Cinsi: ${material.materialTypeName}
      Malzeme Rengi: ${material.materialColorName}
      Raf NO sırası: ${material.shelfRowNo}
      Raf NO Sütunu: ${material.shelfColumnNo}
      Yönü: ${material.materialDirection}
  
      Teşekkürler.
    `);

    window.location.href = `mailto:gokaydemirpc@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="px-4 py-2">Stok Kodu</th>
            <th className="px-4 py-2">Malzeme Sınıfı</th>
            <th className="px-4 py-2">Malzeme Cinsi</th>
            <th className="px-4 py-2">Malzeme Rengi</th>
            <th className="px-4 py-2">Raf NO</th>
            <th className="px-4 py-2">Yönü</th>
            <th className="px-4 py-2">PC Kayıt NO</th>
            <th className="px-4 py-2">Miktar</th>
            <th className="px-4 py-2">Resim</th>
            <th className="px-4 py-2">İşlem</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((material) => (
            <tr key={material.id} className="bg-gray-100">
              <td className="border px-4 py-2">{material.stockCode}</td>
              <td className="border px-4 py-2">{material.materialClassName}</td>
              <td className="border px-4 py-2">{material.materialTypeName}</td>
              <td className="border px-4 py-2">{material.materialColorName}</td>
              <td className="border px-4 py-2">{material.shelfNo}</td>
              <td className="border px-4 py-2">{material.materialDirection}</td>
              <td className="border px-4 py-2">
                {material.pcRegisterNo || ""}
              </td>
              <td className="border px-4 py-2">
                {material.amount || "Stok yok"}
              </td>
              <td className="border px-4 py-2">
                {loadingImages ? (
                  <div className="w-16 h-16 flex items-center justify-center bg-gray-200">
                    Resim yükleniyor...
                  </div>
                ) : imageUrls[material.id] ? (
                  <img
                    src={imageUrls[material.id]}
                    alt="Material"
                    className="cursor-pointer w-16 h-16 object-cover"
                    onClick={() => openImageModal(material.id)}
                  />
                ) : (
                  "Resim yok"
                )}
              </td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => onOpenStockModal(material)}
                  className="bg-blue-500 text-white text-sm p-2 rounded"
                >
                  Stok +/-
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selectedImageUrl && (
        <div
          className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50"
          onClick={handleModalClick}
        >
          <div className="bg-white p-4 rounded-lg relative">
            {/* Close button positioned here */}
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              onClick={closeImageModal}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Image container */}
            <img
              src={selectedImageUrl}
              alt="Material"
              className="max-w-full max-h-screen"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehouseMaterialTable;
