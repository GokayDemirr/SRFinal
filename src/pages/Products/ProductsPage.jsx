import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import firestore from "../../firebase"; // Firebase config dosyanızın yolu

function ProductsPage() {
  const [showProductModal, setShowProductModal] = useState(false);
  const [glassTypes, setGlassTypes] = useState([]);
  const [selectedGlassType, setSelectedGlassType] = useState("");
  const [glassColors, setGlassColors] = useState([]);
  const [selectedGlassColor, setSelectedGlassColor] = useState("");

  useEffect(() => {
    const fetchGlassTypes = async () => {
      try {
        const q = query(
          collection(firestore, "Material"),
          where("materialClassName", "==", "cam")
        );
        const querySnapshot = await getDocs(q);
        const types = querySnapshot.docs.map(
          (doc) => doc.data().materialTypeName
        );
        // Yinelenenleri kaldır
        const uniqueTypes = [...new Set(types)];
        setGlassTypes(uniqueTypes);
      } catch (error) {
        console.error("Cam tipleri alınırken hata oluştu:", error);
      }
    };

    fetchGlassTypes();
  }, []);

  useEffect(() => {
    const fetchGlassColors = async () => {
      if (!selectedGlassType) {
        return;
      }
      try {
        const q = query(
          collection(firestore, "Material"),
          where("materialTypeName", "==", selectedGlassType)
        );
        const querySnapshot = await getDocs(q);
        const colors = querySnapshot.docs.map(
          (doc) => doc.data().materialColorName
        );
        // Yinelenenleri kaldır
        const uniqueColors = [...new Set(colors)];
        setGlassColors(uniqueColors);
      } catch (error) {
        console.error("Cam renkleri alınırken hata oluştu:", error);
      }
    };

    fetchGlassColors();
  }, [selectedGlassType]);

  const handleGlassTypeChange = (event) => {
    setSelectedGlassType(event.target.value);
    setSelectedGlassColor(""); // Yeni cam tipi seçildiğinde rengi sıfırla
  };

  return (
    <div>
      <button onClick={() => setShowProductModal(true)}>Ürün Oluştur</button>

      {/* Modal yapısı burada başlıyor */}
      {showProductModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowProductModal(false);
            }
          }}
        >
          <div className="bg-white p-8 rounded shadow-md">
            <h2 className="text-2xl font-bold mb-4">Ürün Oluştur</h2>

            <div className="mb-4">
              <label htmlFor="glassType" className="block mb-2">
                Cam Cinsi:
              </label>
              <select
                id="glassType"
                value={selectedGlassType}
                onChange={handleGlassTypeChange}
                className="border border-gray-300 px-3 py-2 rounded w-full"
              >
                <option value="">Seçiniz</option>
                {glassTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="glassColor" className="block mb-2">
                Cam Rengi:
              </label>
              <select
                id="glassColor"
                value={selectedGlassColor}
                onChange={(e) => setSelectedGlassColor(e.target.value)}
                className="border border-gray-300 px-3 py-2 rounded w-full"
              >
                <option value="">Seçiniz</option>
                {glassColors.map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
            </div>

            {/* Diğer ürün oluşturma adımları buraya eklenecek */}

            <button
              onClick={() => setShowProductModal(false)}
              className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
      {/* Modal yapısı burada bitiyor */}
    </div>
  );
}

export default ProductsPage;
