import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  collection,
  getDocs,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytes,
  deleteObject,
} from "firebase/storage";
import firestore from "../../firebase";

const MaterialTable = () => {
  const { register, watch, handleSubmit, setValue } = useForm();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [loadingImages, setLoadingImages] = useState(true);
  const [editingPcKayitNo, setEditingPcKayitNo] = useState(null);

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
        return (
          Object.values(item).some(
            (value) =>
              value && value.toString().toLowerCase().includes(searchTerm)
          ) ||
          (item.shelfNo && item.shelfNo.toLowerCase().includes(searchTerm))
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

  const deleteImage = async (id) => {
    try {
      const material = data.find((item) => item.id === id);
      if (material && material.imageUrl) {
        const storageRef = ref(getStorage(), material.imageUrl);
        await deleteObject(storageRef);

        // Firestore'daki imageUrl alanını boş yap
        const materialDoc = doc(firestore, "Material", id);
        await updateDoc(materialDoc, { imageUrl: "" });

        // Local state güncelle
        setImageUrls((prevUrls) => {
          const updatedUrls = { ...prevUrls };
          delete updatedUrls[id];
          return updatedUrls;
        });

        setData((prevData) =>
          prevData.map((material) =>
            material.id === id ? { ...material, imageUrl: "" } : material
          )
        );

        console.log("Resim başarıyla silindi.");
      }
    } catch (error) {
      console.error("Resim silinirken hata oluştu:", error);
    }
  };

  const updatePcRegisterNo = async (id, pcRegisterNo) => {
    try {
      const materialDoc = doc(firestore, "Material", id);
      await updateDoc(materialDoc, { pcRegisterNo });
      setData((prevData) =>
        prevData.map((material) =>
          material.id === id ? { ...material, pcRegisterNo } : material
        )
      );
      setEditingPcKayitNo(null);
    } catch (error) {
      console.error("Error updating pcRegisterNo:", error);
    }
  };

  const handleUpdatePcRegisterNo = (id) => {
    const pcRegisterNo = watch(`pcRegisterNo_${id}`);
    updatePcRegisterNo(id, pcRegisterNo);
  };

  const handleRequestClick = (material) => {
    const subject = encodeURIComponent("PC Kayıt Numarası Talebi");
    const body = encodeURIComponent(`
      Merhaba Serdar Bey,
  
      Aşağıdaki malzeme için PC kayıt numarası talep ediyorum:
  
      Malzeme Sınıfı: ${material.materialClassName}
      Malzeme Cinsi: ${material.materialTypeName}
      Malzeme Rengi: ${material.materialColorName}
      Malzeme Yönü: ${material.materialDirection}
      Raf NO: ${material.shelfNo}  
      Teşekkürler.
    `);

    window.location.href = `mailto:gokaydemirpc@gmail.com?subject=${subject}&body=${body}`;
  };

  const uploadImage = async (id, file) => {
    if (file) {
      try {
        const storageRef = ref(getStorage(), `material/${id}/${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        const materialDoc = doc(firestore, "Material", id);
        await updateDoc(materialDoc, {
          imageUrl: `material/${id}/${file.name}`,
        });
        setImageUrls((prevUrls) => ({ ...prevUrls, [id]: url }));
        setData((prevData) =>
          prevData.map((material) =>
            material.id === id
              ? { ...material, imageUrl: `material/${id}/${file.name}` }
              : material
          )
        );
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="overflow-x-auto">
        <form>
          <input
            type="text"
            className="mt-1 p-1 border rounded"
            placeholder="Ara..."
            {...register("searchTerm")}
          />
        </form>
        <table className="min-w-full bg-white">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-4 py-2">Stok Kodu</th>
              <th className="px-4 py-2">Malzeme Sınıfı</th>
              <th className="px-4 py-2">Malzeme Cinsi</th>
              <th className="px-4 py-2">Malzeme Rengi</th>
              <th className="px-4 py-2">Raf NO</th>
              <th className="px-4 py-2">Malzeme Yönü</th>
              <th className="px-4 py-2">PC Kayıt NO</th>
              <th className="px-4 py-2">Resim</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((material) => (
              <tr key={material.id} className="bg-gray-100">
                <td className="border px-4 py-2">{material.stockCode}</td>
                <td className="border px-4 py-2">
                  {material.materialClassName}
                  {/* Malzeme sınıfı "profil" veya "fitil" ise height'ı göster */}
                  {(material.materialClassName === "profil" ||
                    material.materialClassName === "fitil") &&
                    material.height &&
                    ` - ${material.height}cm`}
                </td>
                <td className="border px-4 py-2">
                  {material.materialTypeName}
                </td>
                <td className="border px-4 py-2">
                  {material.materialColorName}
                </td>
                <td className="border px-4 py-2 whitespace-nowrap">
                  {material.shelfNo}
                </td>
                <td className="border px-4 py-2">
                  {material.materialDirection}
                </td>
                <td className="border px-4 py-2">
                  {editingPcKayitNo === material.id ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleUpdatePcRegisterNo(material.id);
                      }}
                      className="flex flex-col items-start space-y-2"
                    >
                      <input
                        type="text"
                        defaultValue={material.pcRegisterNo}
                        {...register(`pcRegisterNo_${material.id}`)}
                        className="border rounded p-2 w-full"
                      />
                      <div className="flex space-x-2">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                        >
                          Kaydet
                        </button>
                        <button
                          type="button"
                          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
                          onClick={() => setEditingPcKayitNo(null)}
                        >
                          İptal
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      {material.pcRegisterNo ? (
                        <>
                          {material.pcRegisterNo}
                          <div className="flex space-x-2 mt-2">
                            <button
                              type="button"
                              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                              onClick={() => setEditingPcKayitNo(material.id)}
                            >
                              Düzenle
                            </button>
                          </div>
                        </>
                      ) : (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleUpdatePcRegisterNo(material.id);
                          }}
                          className="flex flex-col items-start space-y-2"
                        >
                          <input
                            type="text"
                            placeholder="Pc kayıt no gir"
                            {...register(`pcRegisterNo_${material.id}`)}
                            className="border rounded p-2 w-full"
                          />
                          <div className="flex space-x-2">
                            <button
                              type="submit"
                              className=" p-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
                            >
                              Kaydet
                            </button>
                            <button
                              type="button"
                              className=" p-2 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition"
                              onClick={() => handleRequestClick(material)}
                            >
                              Kod iste
                            </button>
                          </div>
                        </form>
                      )}
                    </>
                  )}
                </td>

                <td className="border px-4 py-2">
                  {loadingImages ? (
                    <div className="w-16 h-16 flex items-center justify-center bg-gray-200">
                      Resim yükleniyor...
                    </div>
                  ) : imageUrls[material.id] ? (
                    <div>
                      <a
                        href={imageUrls[material.id]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                      >
                        Resmi görüntüle
                      </a>
                      <div className="mt-2 flex items-center space-x-2">
                        {/* Resim Yükle Butonu */}
                        <label
                          htmlFor={`file-upload-${material.id}`}
                          className="cursor-pointer p-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                        >
                          Değiştir
                        </label>
                        <input
                          id={`file-upload-${material.id}`}
                          type="file"
                          onChange={(e) => {
                            if (e.target.files[0]) {
                              uploadImage(material.id, e.target.files[0]);
                            }
                          }}
                          className="hidden"
                        />
                        {/* Resmi Sil */}
                        <button
                          onClick={() => deleteImage(material.id)}
                          className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition"
                        >
                          Sil
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {/* Resim Yükle Butonu */}
                      <label
                        htmlFor={`file-upload-${material.id}`}
                        className="cursor-pointer px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                      >
                        Resim Yükle
                      </label>
                      <input
                        id={`file-upload-${material.id}`}
                        type="file"
                        onChange={(e) => {
                          if (e.target.files[0]) {
                            uploadImage(material.id, e.target.files[0]);
                          }
                        }}
                        className="hidden"
                      />
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selectedImageUrl && (
        <div
          className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-800 bg-opacity-75"
          onClick={handleModalClick}
        >
          <div className="relative max-w-3xl mx-auto bg-white p-4 rounded-lg">
            <img
              src={selectedImageUrl}
              alt="Selected Material Image"
              className="max-w-full max-h-screen"
            />
            <button
              className="absolute top-2 right-2 p-2 rounded-full bg-gray-200 hover:bg-gray-300"
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
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialTable;
