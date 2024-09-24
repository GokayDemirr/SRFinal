import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import firestore from "../../../firebase";

const AddMaterialForm = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
  });

  const [materialClass, setMaterialClass] = useState([]);
  const [materialType, setMaterialType] = useState([]);
  const [materialColor, setMaterialColor] = useState([]);
  const [shelfColumnNo, setShelfColumnNo] = useState([]);
  const [FirmaKisaltmasi, setFirmaKisaltmasi] = useState("SR");
  const [imagePreview, setImagePreview] = useState(null);
  const [isFormValid, setIsFormValid] = useState(false);

  const selectedClass = watch("materialClassName");
  const selectedType = watch("materialTypeName");
  const selectedColor = watch("materialColorName");
  const selectedShelfRow = watch("shelfRowNo");
  const selectedShelfColumn = watch("shelfColumnNo");
  const selectedDirection = watch("materialDirection");
  const [availableColumns, setAvailableColumns] = useState([]);

  useEffect(() => {
    const fetchOccupiedShelfColumns = async () => {
      if (selectedShelfRow) {
        try {
          const querySnapshot = await getDocs(
            collection(firestore, "Material")
          );

          // O sıradaki kullanılan sütunları al
          const occupiedColumns = querySnapshot.docs
            .map((doc) => doc.data())
            .filter((item) => item.shelfRowNo === selectedShelfRow)
            .map((item) => item.shelfColumnNo);

          // Kullanılan sütunları kontrol et ve duruma göre sütun listesini güncelle
          const updatedColumns = shelfColumnNo.map((column) => ({
            ...column,
            isOccupied: occupiedColumns.includes(column.ShelfColumnNo), // Eğer bu sütun kullanılıyorsa işaretle
          }));

          setAvailableColumns(updatedColumns);
        } catch (error) {
          console.error("Error fetching occupied shelf columns: ", error);
        }
      } else {
        setAvailableColumns([]); // Eğer sıra seçilmediyse sütunlar sıfırlanır
      }
    };

    fetchOccupiedShelfColumns();
  }, [selectedShelfRow, shelfColumnNo]);

  useEffect(() => {
    const fetchShelfColumns = async () => {
      try {
        const querySnapshot = await getDocs(
          collection(firestore, "ShelfColumns")
        );
        const shelfColumnData = querySnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((item) => !item.isPassive)
          .sort((a, b) => a.ShelfColumnNo - b.ShelfColumnNo);
        setShelfColumnNo(shelfColumnData);
      } catch (error) {
        console.error("Error fetching shelf columns: ", error);
      }
    };

    fetchShelfColumns();
  }, []);

  useEffect(() => {
    const fetchMaterialClass = async () => {
      try {
        const querySnapshot = await getDocs(
          collection(firestore, "MaterialClass")
        );
        const materialClassData = querySnapshot.docs
          .map((doc) => ({
            id: doc.id,
            materialClassName: doc.data().materialClassName,
            stockCode: doc.data().stockCode, // stockCode ekledik
          }))
          .filter((item) => !item.isPassive);
        setMaterialClass(materialClassData);
      } catch (error) {
        console.error("Error fetching material class: ", error);
      }
    };

    fetchMaterialClass();
  }, []);

  useEffect(() => {
    const fetchMaterialTypeAndColor = async () => {
      if (selectedClass) {
        try {
          // Malzeme Cinsleri
          const typeSnapshot = await getDocs(
            collection(
              firestore,
              "MaterialClass",
              selectedClass,
              "MaterialType"
            )
          );
          const materialTypeData = typeSnapshot.docs.map((doc) => ({
            id: doc.id,
            materialTypeName: doc.data().materialTypeName,
            stockCode: doc.data().stockCode, // stockCode ekledik
          }));
          setMaterialType(materialTypeData);

          // Malzeme Renkleri
          const colorSnapshot = await getDocs(
            collection(
              firestore,
              "MaterialClass",
              selectedClass,
              "MaterialColor"
            )
          );
          const materialColorData = colorSnapshot.docs.map((doc) => ({
            id: doc.id,
            materialColorName: doc.data().materialColorName,
            stockCode: doc.data().stockCode, // stockCode ekledik
          }));
          setMaterialColor(materialColorData);
        } catch (error) {
          console.error("Error fetching material type or color: ", error);
        }
      } else {
        setMaterialType([]);
        setMaterialColor([]);
      }
    };

    fetchMaterialTypeAndColor();
  }, [selectedClass]);

  useEffect(() => {
    setIsFormValid(
      selectedClass &&
        selectedType &&
        selectedColor &&
        selectedShelfRow &&
        selectedShelfColumn &&
        selectedDirection
    );
  }, [
    selectedClass,
    selectedType,
    selectedColor,
    selectedShelfRow,
    selectedShelfColumn,
    selectedDirection,
  ]);

  const uploadImage = async (file, stockCode) => {
    const storage = getStorage();
    const storageRef = ref(storage, `images/${stockCode}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url;
  };

  const onSubmit = async (data) => {
    if (selectedClass) {
      const {
        materialClassName,
        materialTypeName,
        materialColorName,
        materialDirection,
        shelfRowNo,
        shelfColumnNo,
        pcRegisterNo,
        image,
      } = data;

      const selectedMaterialClass = materialClass.find(
        (item) => item.id === materialClassName
      );
      const selectedMaterialType = materialType.find(
        (item) => item.id === materialTypeName
      );
      const selectedMaterialColor = materialColor.find(
        (item) => item.id === materialColorName
      );

      const stockCode = `${FirmaKisaltmasi}${
        selectedMaterialClass?.stockCode || ""
      }${selectedMaterialType?.stockCode || ""}${
        selectedMaterialColor?.stockCode || ""
      }${
        materialDirection === "Yön Yok"
          ? "00"
          : materialDirection === "Sol"
          ? "01"
          : "02"
      }`;

      const shelfNo = `${shelfRowNo}-${shelfColumnNo}`;

      try {
        // Firebase'den mevcut malzeme kombinasyonunu kontrol et
        const querySnapshot = await getDocs(collection(firestore, "Material"));
        const existingMaterial = querySnapshot.docs.find((doc) => {
          const materialData = doc.data();
          return (
            materialData.materialClassName ===
              selectedMaterialClass?.materialClassName &&
            materialData.materialTypeName ===
              selectedMaterialType?.materialTypeName &&
            materialData.materialColorName ===
              selectedMaterialColor?.materialColorName &&
            materialData.materialDirection === materialDirection &&
            materialData.shelfNo === shelfNo // Kontrol ekledik
          );
        });

        if (existingMaterial) {
          alert("Seçtiğiniz özelliklerde bir malzeme halihazırda eklenmiş.");
          return; // Var olan malzeme bulunduysa işlemi durdur
        }

        let imageUrl = "";
        if (image && image.length > 0) {
          const imageFile = image[0];
          imageUrl = await uploadImage(imageFile, stockCode);
        }

        // Eğer aynı malzeme yoksa, yeni malzemeyi ekle
        const docRef = await addDoc(collection(firestore, "Material"), {
          stockCode,
          materialClassName: selectedMaterialClass?.materialClassName,
          materialTypeName: selectedMaterialType?.materialTypeName,
          materialColorName: selectedMaterialColor?.materialColorName,
          shelfNo, // Tekil alan olarak ekledik
          materialDirection,
          pcRegisterNo,
          imageUrl,
          amount: 0,
        });

        console.log("Document written with ID: ", docRef.id);
        window.location.reload();
      } catch (error) {
        console.error("Error adding document: ", error);
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRequestClick = () => {
    const subject = encodeURIComponent("PC Kayıt Numarası Talebi");
    const body = encodeURIComponent(`
        Merhaba Serdar Bey,

        Aşağıdaki malzeme için PC kayıt numarası talep ediyorum:

        Malzeme Sınıfı: ${selectedClass}
        Malzeme Cinsi: ${selectedType}
        Malzeme Rengi: ${selectedColor}
        Raf NO sırası: ${selectedShelfRow}
        Raf NO Sütunu: ${selectedShelfColumn}
        Yönü: ${selectedDirection}

        Teşekkürler.
      `);

    window.location.href = `mailto:gokaydemirpc@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="modal-overlay max-w-s mx-auto p-4 bg-white shadow-md rounded-md"
    >
      <div className="flex flex-col space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Firma Kısaltması
          </label>
          <input
            className="mt-1 block w-full px-3 py-2 bg-gray-400 border border-gray-300 rounded-md cursor-none"
            defaultValue="SR"
            readOnly
            {...register("FirmaKisaltmasi")}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Malzeme Sınıfı:
          </label>
          <select
            className={`mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
              errors.materialClassName ? "border-red-500" : ""
            }`}
            {...register("materialClassName", { required: true })}
          >
            <option value="">Seçiniz</option>
            {materialClass.map((item) => (
              <option key={item.id} value={item.id}>
                {item.materialClassName}
              </option>
            ))}
          </select>
          {errors.materialClassName && (
            <p className="text-red-500 text-sm mt-1">
              Malzeme Sınıfı gereklidir.
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Malzeme Cinsi:
          </label>
          <select
            className={`mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
              errors.materialTypeName ? "border-red-500" : ""
            }`}
            {...register("materialTypeName", { required: true })}
            disabled={!selectedClass}
          >
            <option value="">Seçiniz</option>
            {materialType.map((item) => (
              <option key={item.id} value={item.id}>
                {item.materialTypeName}
              </option>
            ))}
          </select>
          {errors.materialTypeName && (
            <p className="text-red-500 text-sm mt-1">
              Malzeme Cinsi gereklidir.
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Malzeme Rengi:
          </label>
          <select
            className={`mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
              errors.materialColorName ? "border-red-500" : ""
            }`}
            {...register("materialColorName", { required: true })}
            disabled={!selectedClass}
          >
            <option value="">Seçiniz</option>
            {materialColor.map((item) => (
              <option key={item.id} value={item.id}>
                {item.materialColorName}
              </option>
            ))}
          </select>
          {errors.materialColorName && (
            <p className="text-red-500 text-sm mt-1">
              Malzeme Rengi gereklidir.
            </p>
          )}
        </div>

        <div>
          <div className="flex space-x-4">
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700">
                Raf No Sırası:
              </label>
              <select
                className={`mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.shelfRowNo ? "border-red-500" : ""
                }`}
                {...register("shelfRowNo", { required: true })}
              >
                <option value="">Seçiniz</option>
                {["A", "B", "C", "D", "E"].map((row) => (
                  <option key={row} value={row}>
                    {row}
                  </option>
                ))}
              </select>
              {errors.shelfRowNo && (
                <p className="text-red-500 text-sm mt-1">
                  Raf No Sırası gereklidir.
                </p>
              )}
            </div>

            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700">
                Raf No Sütunu:
              </label>
              <select
                className={`mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.shelfColumnNo ? "border-red-500" : ""
                }`}
                {...register("shelfColumnNo", { required: true })}
              >
                <option value="">Seçiniz</option>
                {shelfColumnNo.map((item) => (
                  <option key={item.id} value={item.ShelfColumnNo}>
                    {item.ShelfColumnNo}
                  </option>
                ))}
              </select>
              {errors.shelfColumnNo && (
                <p className="text-red-500 text-sm mt-1">
                  Raf No Sütunu gereklidir.
                </p>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Yönü:
          </label>
          <select
            className={`mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
              errors.materialDirection ? "border-red-500" : ""
            }`}
            {...register("materialDirection", { required: true })}
          >
            <option value="">Seçiniz</option>
            <option value="Yön Yok">Yön Yok</option>
            <option value="Sol">Sol</option>
            <option value="Sağ">Sağ</option>
          </select>
          {errors.materialDirection && (
            <p className="text-red-500 text-sm mt-1">Yönü gereklidir.</p>
          )}
        </div>

        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">
              PC Kayıt No:
            </label>
            <input
              type="text"
              className={`mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.pcRegisterNo ? "border-red-500" : ""
              }`}
              {...register("pcRegisterNo")}
            />
          </div>

          <div className="flex-1 flex items-end">
            <button
              type="button"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={handleRequestClick}
            >
              PC Kayıt No Talep Et
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Resim:
          </label>
          <input
            type="file"
            className={`mt-1 block w-full ${
              errors.image ? "border-red-500" : ""
            }`}
            {...register("image")}
            onChange={handleImageChange}
          />
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="mt-4 w-24 h-24 object-cover"
            />
          )}
        </div>

        <div>
          <button
            type="submit"
            className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
              isFormValid ? "bg-indigo-600 hover:bg-indigo-700" : "bg-gray-400"
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            disabled={!isFormValid}
          >
            Malzeme Ekle
          </button>
        </div>
      </div>
    </form>
  );
};

export default AddMaterialForm;
