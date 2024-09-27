import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import firestore from "../../firebase";

function SideProductsPage() {
  const partCategories = [
    "Cam",
    "Profil",
    "Kulp",
    "Fitil",
    "Mıknatıs",
    "Sabitleyici",
  ];

  const [formData, setFormData] = useState({
    seriesName: "",
    parts: partCategories.reduce(
      (acc, category) => ({
        ...acc,
        [category]: { materialType: "", materialColor: "" },
      }),
      {}
    ),
  });

  const [seriesOptions, setSeriesOptions] = useState([]);
  const [materialTypes, setMaterialTypes] = useState({});
  const [materialColors, setMaterialColors] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch series names from Firestore
  useEffect(() => {
    const fetchSeries = async () => {
      const seriesCollection = collection(firestore, "Series");
      const seriesSnapshot = await getDocs(seriesCollection);
      const seriesList = seriesSnapshot.docs.map(
        (doc) => doc.data().seriesName
      );
      setSeriesOptions([...seriesList, "Özel"]); // Adding the "Özel" option manually
    };

    fetchSeries();
  }, []);

  // Fetch material types based on selected material class (e.g., Cam)
  const fetchMaterialTypes = async (category) => {
    const materialQuery = query(
      collection(firestore, "Material"),
      where("materialClassName", "==", category)
    );
    const materialSnapshot = await getDocs(materialQuery);
    const materialList = materialSnapshot.docs.map(
      (doc) => doc.data().materialTypeName
    );
    setMaterialTypes((prev) => ({ ...prev, [category]: materialList }));
  };

  // Fetch material colors based on selected material type
  const fetchMaterialColors = async (category, materialType) => {
    const colorQuery = query(
      collection(firestore, "Material"),
      where("materialTypeName", "==", materialType)
    );
    const colorSnapshot = await getDocs(colorQuery);
    const colorList = colorSnapshot.docs.map(
      (doc) => doc.data().materialColorName
    );
    setMaterialColors((prev) => ({ ...prev, [category]: colorList }));
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleMaterialChange = (category, field, value) => {
    if (field === "materialType") {
      fetchMaterialColors(category, value);
    }
    setFormData((prevData) => ({
      ...prevData,
      parts: {
        ...prevData.parts,
        [category]: { ...prevData.parts[category], [field]: value },
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Submitted:", formData);
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <form onSubmit={handleSubmit}>
                  <h2 className="text-xl font-bold mb-4">Ürün Oluştur</h2>

                  <div className="mb-4">
                    <label className="block mb-2">Seri Adı:</label>
                    <select
                      name="seriesName"
                      className="border border-gray-300 rounded w-full p-2"
                      value={formData.seriesName}
                      onChange={handleChange}
                      required
                    >
                      {seriesOptions.map((option, index) => (
                        <option key={index} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  {partCategories.map((category) => (
                    <div key={category} className="mb-4">
                      <h3 className="text-lg font-semibold">{category}</h3>
                      <div className="mb-2">
                        <label>Tür:</label>
                        <select
                          className="border border-gray-300 rounded p-2 w-full"
                          value={formData.parts[category].materialType}
                          onChange={(e) =>
                            handleMaterialChange(
                              category,
                              "materialType",
                              e.target.value
                            )
                          }
                        >
                          {materialTypes[category]?.map((type, index) => (
                            <option key={index} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label>Renk:</label>
                        <select
                          className="border border-gray-300 rounded p-2 w-full"
                          value={formData.parts[category].materialColor}
                          onChange={(e) =>
                            handleMaterialChange(
                              category,
                              "materialColor",
                              e.target.value
                            )
                          }
                        >
                          {materialColors[category]?.map((color, index) => (
                            <option key={index} value={color}>
                              {color}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}

                  <button
                    type="submit"
                    className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
                  >
                    Ürün Oluştur
                  </button>
                </form>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold">Seçilen Parçalar</h3>
                <ul className="list-disc pl-5 space-y-4">
                  {partCategories.map((category) => (
                    <li key={category}>
                      <h4 className="font-semibold">{category}</h4>
                      <ul className="list-disc pl-5">
                        <li>Tür: {formData.parts[category].materialType}</li>
                        <li>Renk: {formData.parts[category].materialColor}</li>
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SideProductsPage;
