import ModalButton from "../../components/Buttons/ModalButton/ModalButton";
import AddMaterialForm from "../../components/Forms/AddForms/AddMaterialForm";
import MaterialTable from "../../components/Tables/MaterialTable";

const MaterialsPage = () => {
  return (
    <div>
      <ModalButton buttonName={"Yeni malzeme ekle"}>
        <AddMaterialForm />
      </ModalButton>
      <MaterialTable />
    </div>
  );
};

export default MaterialsPage;
