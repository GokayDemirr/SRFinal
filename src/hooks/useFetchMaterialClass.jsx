import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import firestore from "../firebase";

const useFetchMaterialClass = () => {
  const [materialClass, setMaterialClass] = useState([]);

  useEffect(() => {
    const fetchMaterialClass = async () => {
      const materialClassSnapshot = await getDocs(
        collection(firestore, "MaterialClass")
      );
      setMaterialClass(
        materialClassSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    };

    fetchMaterialClass();
  }, []);

  return materialClass;
};

export default useFetchMaterialClass;
