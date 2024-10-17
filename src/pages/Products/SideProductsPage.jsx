import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import firestore from "../../firebase";

function SideProductsPage() {
  const partCategories = [
    { name: "Cam", className: "cam" },
    { name: "Profil", className: "profil" },
    { name: "Kulp", className: "kulp" },
    { name: "Fitil", className: "fitil" },
    { name: "Mıknatıs", className: "mıknatıs" },
    { name: "Sabitleyici", className: "sabitleyici" },
  ];

  const [formData, setFormData] = useState({
    seriesName: "",
    modelCode: "",
    parts: partCategories.reduce(
      (acc, category) => ({
        ...acc,
        [category.name]: { materialType: "" },
      }),
      {}
    ),
    cornerShape: "",
    dimensions: {
      widthMin: "",
      widthMax: "",
      height: "",
      depth: "",
    },
    images: [],
    pdf: null,
    dwg: null,
  });

  const [seriesOptions, setSeriesOptions] = useState([]);
  const [materialRegisterNos, setMaterialRegisterNos] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch series names from Firestore
  useEffect(() => {
    const fetchSeries = async () => {
      const seriesCollection = collection(firestore, "Series");
      const seriesSnapshot = await getDocs(seriesCollection);
      const seriesList = seriesSnapshot.docs.map(
        (doc) => doc.data().seriesName
      );
      setSeriesOptions([...seriesList, "Özel"]);
    };

    fetchSeries();
  }, []);

  // Fetch pcRegisterNo values from Material documents based on materialClassName
  const fetchMaterialRegisterNos = async () => {
    const materialCollection = collection(firestore, "Material");

    const promises = partCategories.map(async (category) => {
      const q = query(
        materialCollection,
        where("materialClassName", "==", category.className)
      );
      const materialSnapshot = await getDocs(q);

      return {
        category: category.name,
        registerNos: materialSnapshot.docs
          .map((doc) => doc.data().pcRegisterNo)
          .filter(Boolean),
      };
    });

    const results = await Promise.all(promises);
    const registerNosMap = results.reduce((acc, curr) => {
      acc[curr.category] = curr.registerNos;
      return acc;
    }, {});

    setMaterialRegisterNos(registerNosMap);
  };

  useEffect(() => {
    fetchMaterialRegisterNos();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleMaterialChange = (category, value) => {
    setFormData((prevData) => ({
      ...prevData,
      parts: {
        ...prevData.parts,
        [category]: { materialType: value },
      },
    }));
  };

  const handleUpload = (e, type) => {
    if (type === "image") {
      const files = Array.from(e.target.files);
      if (files.length <= 4) {
        setFormData((prev) => ({ ...prev, images: files }));
      } else {
        alert("Maksimum 4 resim yüklenebilir.");
      }
    } else if (type === "pdf") {
      setFormData((prev) => ({ ...prev, pdf: e.target.files[0] }));
    } else if (type === "dwg") {
      setFormData((prev) => ({ ...prev, dwg: e.target.files[0] }));
    }
  };

  const handleCornerShapeChange = (e) => {
    setFormData((prev) => ({ ...prev, cornerShape: e.target.value }));
  };

  const handleDimensionsChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [e.target.name]: e.target.value,
      },
    }));
  };

  const renderDimensionsInputs = () => {
    const { cornerShape } = formData;
    const heightOptions = Array.from(
      { length: 11 },
      (_, index) => (index + 15) * 10
    );

    switch (cornerShape) {
      case "2 duvar arası":
        return (
          <>
            <input
              type="number"
              name="widthMin"
              placeholder="Genişlik Min"
              value={formData.dimensions.widthMin}
              onChange={handleDimensionsChange}
            />
            <input
              type="number"
              name="widthMax"
              placeholder="Genişlik Max"
              value={formData.dimensions.widthMax}
              onChange={handleDimensionsChange}
            />
            <select
              name="height"
              value={formData.dimensions.height}
              onChange={handleDimensionsChange}
            >
              <option value="">Yükseklik Seçin</option>
              {heightOptions.map((height) => (
                <option key={height} value={height}>
                  {height}
                </option>
              ))}
            </select>
          </>
        );

      case "köşe":
        return (
          <>
            <input
              type="number"
              name="widthMin"
              placeholder="Genişlik Min 1"
              value={formData.dimensions.widthMin}
              onChange={handleDimensionsChange}
            />
            <input
              type="number"
              name="widthMax"
              placeholder="Genişlik Max 1"
              value={formData.dimensions.widthMax}
              onChange={handleDimensionsChange}
            />
            <input
              type="number"
              name="widthMin2"
              placeholder="Genişlik Min 2"
              value={formData.dimensions.widthMin2}
              onChange={handleDimensionsChange}
            />
            <input
              type="number"
              name="widthMax2"
              placeholder="Genişlik Max 2"
              value={formData.dimensions.widthMax2}
              onChange={handleDimensionsChange}
            />
            <select
              name="height"
              value={formData.dimensions.height}
              onChange={handleDimensionsChange}
            >
              <option value="">Yükseklik Seçin</option>
              {heightOptions.map((height) => (
                <option key={height} value={height}>
                  {height}
                </option>
              ))}
            </select>
          </>
        );

      case "düz duvar":
        return (
          <>
            <input
              type="number"
              name="widthMin"
              placeholder="Genişlik Min"
              value={formData.dimensions.widthMin}
              onChange={handleDimensionsChange}
            />
            <input
              type="number"
              name="depth"
              placeholder="Derinlik"
              value={formData.dimensions.depth}
              onChange={handleDimensionsChange}
            />
            <select
              name="height"
              value={formData.dimensions.height}
              onChange={handleDimensionsChange}
            >
              <option value="">Yükseklik Seçin</option>
              {heightOptions.map((height) => (
                <option key={height} value={height}>
                  {height}
                </option>
              ))}
            </select>
          </>
        );

      case "küvet üstü":
        return (
          <>
            <input
              type="number"
              name="widthMin"
              placeholder="Genişlik"
              value={formData.dimensions.widthMin}
              onChange={handleDimensionsChange}
            />
            <select
              name="height"
              value={formData.dimensions.height}
              onChange={handleDimensionsChange}
            >
              <option value="">Yükseklik Seçin</option>
              {heightOptions.map((height) => (
                <option key={height} value={height}>
                  {height}
                </option>
              ))}
            </select>
          </>
        );

      default:
        return null;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Submitted:", formData);
    // Add your form submission logic here
  };

  return (
    <div>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={() => setIsModalOpen(true)}
      >
        Kabin oluştur
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-4xl max-h-screen h-full overflow-y-auto">
            <button
              className="text-gray-500 hover:text-gray-800 absolute top-4 right-4"
              onClick={() => setIsModalOpen(false)}
            >
              &times;
            </button>

            <form onSubmit={handleSubmit}>
              <h2 className="text-xl font-bold mb-4">Kabin Oluştur</h2>

              <div className="mb-4">
                <label className="block mb-2">Seri Seçin:</label>
                <select
                  className="border border-gray-300 rounded w-full p-2"
                  name="seriesName"
                  value={formData.seriesName}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seri Seçin</option>
                  {seriesOptions.map((series) => (
                    <option key={series} value={series}>
                      {series}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block mb-2">Model Kodu:</label>
                <input
                  type="text"
                  name="modelCode"
                  className="border border-gray-300 rounded w-full p-2"
                  value={formData.modelCode}
                  onChange={handleChange}
                  required
                />
              </div>

              {partCategories.map((category) => (
                <div key={category.name} className="mb-4">
                  <label className="block mb-2">{category.name} Seçin:</label>
                  <select
                    className="border border-gray-300 rounded w-full p-2"
                    value={formData.parts[category.name].materialType}
                    onChange={(e) =>
                      handleMaterialChange(category.name, e.target.value)
                    }
                  >
                    <option value="">Malzeme Seçin</option>
                    {materialRegisterNos[category.name]?.map((no, index) => (
                      <option key={index} value={no}>
                        {no}
                      </option>
                    ))}
                  </select>
                </div>
              ))}

              <div className="mb-4">
                <label className="block mb-2">Köşe Şekli:</label>
                <select
                  className="border border-gray-300 rounded w-full p-2"
                  value={formData.cornerShape}
                  onChange={handleCornerShapeChange}
                >
                  <option value="">Seçin</option>
                  <option value="2 duvar arası">2 Duvar Arası</option>
                  <option value="köşe">Köşe</option>
                  <option value="düz duvar">Düz Duvar</option>
                  <option value="küvet üstü">Küvet Üstü</option>
                </select>
              </div>

              {renderDimensionsInputs()}

              <div className="mb-4">
                <label className="block mb-2">Resim Yükle (Max 4):</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleUpload(e, "image")}
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2">PDF Yükle:</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleUpload(e, "pdf")}
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2">DWG Yükle:</label>
                <input
                  type="file"
                  accept=".dwg"
                  onChange={(e) => handleUpload(e, "dwg")}
                />
              </div>

              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Oluştur
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SideProductsPage;
