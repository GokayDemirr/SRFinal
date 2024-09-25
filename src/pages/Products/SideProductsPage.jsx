import React, { useState } from "react";
import ModalButton from "../../components/Buttons/ModalButton/ModalButton";

function SideProductsPage() {
  const [formData, setFormData] = useState({
    productName: "",
    productQuantity: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you can handle form submission, e.g., send data to an API
    console.log("Form Submitted:", formData);
  };

  return (
    <div>
      <ModalButton buttonName={"Yarı mamül oluştur"}>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Product Name</label>
            <input
              type="text"
              name="productName"
              value={formData.productName}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Product Quantity</label>
            <input
              type="number"
              name="productQuantity"
              value={formData.productQuantity}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit">Create Product</button>
        </form>
      </ModalButton>
    </div>
  );
}

export default SideProductsPage;
