import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import firestore from "../firebase";

const useFetchMaterialTypes = () => {
  const [materialTypes, setMaterialTypes] = useState([]);

  useEffect(() => {
    const fetchMaterialTypes = async () => {
      const materialTypesCollection = collection(firestore, "MalzemeCinsi");
      const materialTypesSnapshot = await getDocs(materialTypesCollection);
      setMaterialTypes(
        materialTypesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    };

    fetchMaterialTypes();
  }, []);

  return materialTypes;
};

export default useFetchMaterialTypes;
