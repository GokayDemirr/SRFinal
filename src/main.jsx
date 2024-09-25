import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import MaterialsPage from "./pages/Materials/MaterialsPage.jsx";
import SeriesPage from "./pages/Products/SeriesPage.jsx";

import MaterialClassesPage from "./pages/Materials/MaterialsClassesPage.jsx";
import MaterialTypesPage from "./pages/Materials/MaterialTypesPage.jsx";
import MaterialColorsPage from "./pages/Materials/MaterialColorsPage.jsx";
import SuppliersPage from "./pages/CurrentAccounts/SuppliersPage.jsx";
import CustomersPage from "./pages/CurrentAccounts/CustomersPage.jsx";
import WarehousePage from "./pages/Warehouse/WarehousePage.jsx";
import SupplyWarehousePage from "./pages/Warehouse/SupplyWarehousePage.jsx";
import StockConfirmations from "./pages/StockConfirmations/StockConfirmations.jsx";
import ProductsPage from "./pages/Products/ProductsPage.jsx";
import SideProductsPage from "./pages/Products/SideProductsPage.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "materials", element: <MaterialsPage /> },
      { path: "materialClasses", element: <MaterialClassesPage /> },
      { path: "materialTypes", element: <MaterialTypesPage /> },
      { path: "materialColors", element: <MaterialColorsPage /> },
      { path: "products", element: <ProductsPage /> },
      { path: "sideProducts", element: <SideProductsPage /> },
      { path: "series", element: <SeriesPage /> },
      { path: "services", element: <div>Services Content</div> },
      { path: "contact", element: <div>Contact Content</div> },
      { path: "warehouse", element: <WarehousePage /> },
      { path: "supplyWarehouse", element: <SupplyWarehousePage /> },
      { path: "suppliers", element: <SuppliersPage /> },
      { path: "customers", element: <CustomersPage /> },
      {
        path: "stockConfirmations",
        element: <StockConfirmations />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
