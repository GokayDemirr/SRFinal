import React, { useEffect, useState } from "react";
import { collection, addDoc, getDocs } from "firebase/firestore";
import firestore from "../../firebase"; // Firebase config dosyanızın yolu

function SeriesPage() {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    seriesName: "",
    dataCode: "",
    openingStyle: "",
  });
  const [heightOptions, setHeightOptions] = useState([]);
  const [seriesData, setSeriesData] = useState([]);

  // Formdaki değişiklikleri güncelleme
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Veri ekleme fonksiyonu
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const seriesCollection = collection(firestore, "Series");
      await addDoc(seriesCollection, {
        seriesName: formData.seriesName,
        dataCode: formData.dataCode,
        openingStyle: formData.openingStyle,
        heightOptions: heightOptions.map((height) => parseFloat(height)), // Yükseklik ölçüleri
      });

      // Formu sıfırla ve modalı kapat
      setFormData({
        seriesName: "",
        dataCode: "",
        openingStyle: "",
      });
      setHeightOptions([]);
      setShowModal(false);

      // Verileri güncelle
      fetchSeriesData();
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  // Firebase'den verileri çekme
  const fetchSeriesData = async () => {
    try {
      const seriesCollection = collection(firestore, "Series");
      const querySnapshot = await getDocs(seriesCollection);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSeriesData(data);
    } catch (error) {
      console.error("Veriler alınırken hata oluştu:", error);
    }
  };

  // Component yüklendiğinde verileri çek
  useEffect(() => {
    fetchSeriesData();
  }, []);

  return (
    <div>
      <button
        onClick={() => setShowModal(true)}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-12"
      >
        Seri Oluştur
      </button>

      {/* Arama kutusu */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Seri adına, model koduna, vb. göre ara..."
          className="border border-gray-300 px-3 py-2 rounded w-full"
        />
      </div>

      {/* Tabloda verilerin görüntülenmesi */}
      <table className="table-auto w-full border-collapse border border-gray-200">
        <thead>
          <tr>
            <th className="border px-4 py-2">Seri Adı</th>
            <th className="border px-4 py-2">Data Kodu</th>
            <th className="border px-4 py-2">Açılış Tarzı</th>
            <th className="border px-4 py-2">Yükseklikler</th>
          </tr>
        </thead>
        <tbody>
          {seriesData.map((series) => (
            <tr key={series.id}>
              <td className="border px-4 py-2">{series.seriesName}</td>
              <td className="border px-4 py-2">{series.dataCode}</td>
              <td className="border px-4 py-2">{series.openingStyle}</td>
              <td className="border px-4 py-2">
                {series.heightOptions && series.heightOptions.join(", ")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal Form */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
              setFormData({
                seriesName: "",
                dataCode: "",
                openingStyle: "",
              });
              setHeightOptions([]);
            }
          }}
        >
          <div className="bg-white px-8 py-2 rounded shadow-md w-full max-w-3xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Seri Oluştur</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div className="mb-4">
                <label htmlFor="seriesName" className="block mb-2">
                  Seri Adı:
                </label>
                <input
                  type="text"
                  id="seriesName"
                  name="seriesName"
                  value={formData.seriesName}
                  onChange={handleChange}
                  className="border border-gray-300 px-3 py-2 rounded w-full"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="dataCode" className="block mb-2">
                  Data Kodu:
                </label>
                <input
                  type="text"
                  id="dataCode"
                  name="dataCode"
                  value={formData.dataCode}
                  onChange={handleChange}
                  className="border border-gray-300 px-3 py-2 rounded w-full"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="openingStyle" className="block mb-2">
                  Açılış Tarzı:
                </label>
                <select
                  id="openingStyle"
                  name="openingStyle"
                  value={formData.openingStyle}
                  onChange={handleChange}
                  className="border border-gray-300 px-3 py-2 rounded w-full"
                  required
                >
                  <option value="">Seçiniz</option>
                  <option value="menteşeli">Menteşeli</option>
                  <option value="sürgülü">Sürgülü</option>
                  <option value="katlanır">Katlanır</option>
                  <option value="sabit cam">Sabit Cam</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block mb-2">Yükseklik Ölçüleri (cm):</label>
                <ul>
                  {heightOptions.map((height, index) => (
                    <li key={index} className="flex items-center mb-2">
                      <input
                        type="number"
                        value={height}
                        onChange={(e) => {
                          const updatedHeights = [...heightOptions];
                          updatedHeights[index] = parseFloat(e.target.value);
                          setHeightOptions(updatedHeights);
                        }}
                        className="border border-gray-300 px-3 py-2 rounded w-full mr-2"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updatedHeights = [...heightOptions];
                          updatedHeights.splice(index, 1);
                          setHeightOptions(updatedHeights);
                        }}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs"
                      >
                        Kaldır
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => setHeightOptions([...heightOptions, ""])}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Ekle
                </button>
              </div>

              <button
                type="submit"
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                Kaydet
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setFormData({
                    seriesName: "",
                    dataCode: "",
                    openingStyle: "",
                  });
                  setHeightOptions([]);
                }}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded ml-2"
              >
                Kapat
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SeriesPage;
