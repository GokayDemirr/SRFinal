import { useState } from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  const [isWarehouseOpen, setIsWarehouseOpen] = useState(false);
  const [isCurrentAccountsOpen, setIsCurrentAccountsOpen] = useState(false);
  const [isMaterialsOpen, setIsMaterialsOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);

  const toggleWarehouse = () => setIsWarehouseOpen(!isWarehouseOpen);
  const toggleCurrentAccounts = () =>
    setIsCurrentAccountsOpen(!isCurrentAccountsOpen);
  const toggleMaterials = () => setIsMaterialsOpen(!isMaterialsOpen);
  const toggleProducts = () => setIsProductsOpen(!isProductsOpen);

  return (
    <nav className="bg-zinc-50 w-60 h-screen p-4 shadow-md">
      <ul>
        <li className="mb-2">
          <div onClick={toggleCurrentAccounts} className="cursor-pointer">
            Cariler
          </div>
          {isCurrentAccountsOpen && (
            <ul className="ml-4">
              <li className="mb-2">
                <Link to="suppliers">Tedarikçiler</Link>
              </li>
              <li className="mb-2">
                <Link to="customers">Müşteriler</Link>
              </li>
            </ul>
          )}
        </li>
        <li className="mb-2">
          <div onClick={toggleProducts} className="cursor-pointer">
            Ürünler
          </div>
          {isProductsOpen && (
            <ul className="ml-4">
              <li className="mb-2">
                <Link to="series">Seriler</Link>
              </li>
              <li className="mb-2">
                <Link to="sideProducts">Yarı mamüller</Link>
              </li>
              <li className="mb-2">
                <Link to="products">Ana mamüller</Link>
              </li>
            </ul>
          )}
        </li>
        <li className="mb-2">
          <div onClick={toggleWarehouse} className="cursor-pointer">
            Depo
          </div>
          {isWarehouseOpen && (
            <ul className="ml-4">
              <li className="mb-2">
                <Link to="warehouse">Depo</Link>
              </li>
              <li className="mb-2">
                <Link to="supplyWarehouse">Tedarik Depo</Link>
              </li>
            </ul>
          )}
        </li>
        <li className="mb-2">
          <Link to="stockConfirmations">Stok Onayı Bekleyenler</Link>
        </li>

        <li className="mb-2">
          <div onClick={toggleMaterials} className="cursor-pointer">
            Malzemeler
          </div>
          {isMaterialsOpen && (
            <ul className="ml-4">
              <li className="mb-2">
                <Link to="materials">Malzemeler</Link>
              </li>
              <li className="mb-2">
                <Link to="materialClasses">Malzeme Sınıfları</Link>
              </li>
              <li className="mb-2">
                <Link to="materialTypes">Malzeme Cinsleri</Link>
              </li>
              <li className="mb-2">
                <Link to="materialColors">Malzeme Renkleri</Link>
              </li>
            </ul>
          )}
        </li>
      </ul>
    </nav>
  );
};

export default Sidebar;
