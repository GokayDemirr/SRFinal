import React from "react";
import { getStorage, ref, getDownloadURL } from "firebase/storage";

const MaterialDetailModal = ({ material, onClose }) => {
  const [imageUrl, setImageUrl] = React.useState(null);

  React.useEffect(() => {
    const fetchImageUrl = async () => {
      if (material.imageUrl) {
        try {
          const url = await getDownloadURL(
            ref(getStorage(), material.imageUrl)
          );
          setImageUrl(url);
        } catch (error) {
          console.error("Error fetching image URL:", error);
        }
      }
    };

    fetchImageUrl();
  }, [material.imageUrl]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded shadow-lg max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">Malzeme Detayları</h2>
        <div className="mb-4">
          <p>
            <strong>Stok Kodu:</strong> {material.stockCode}
          </p>
          <p>
            <strong>Malzeme Sınıfı:</strong> {material.materialClassName}
          </p>
          <p>
            <strong>Malzeme Cinsi:</strong> {material.materialTypeName}
          </p>
          <p>
            <strong>Malzeme Rengi:</strong> {material.materialColorName}
          </p>
          <p>
            <strong>Yönü:</strong> {material.materialDirection}
          </p>
          <p>
            <strong>Raf NO Satırı:</strong> {material.shelfRowNo}
          </p>
          <p>
            <strong>Raf NO Sütunu:</strong> {material.shelfColumnNo}
          </p>
          <p>
            <strong>PC Kayıt NO:</strong> {material.pcRegisterNo}
          </p>
        </div>
        {imageUrl && (
          <div className="mb-4">
            <img
              src={imageUrl}
              alt="Material"
              className="w-full h-auto object-cover"
            />
          </div>
        )}
        <button
          onClick={onClose}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Kapat
        </button>
      </div>
    </div>
  );
};

export default MaterialDetailModal;
