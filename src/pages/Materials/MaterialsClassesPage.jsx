import ModalButton from "../../components/Buttons/ModalButton/ModalButton";
import AddMaterialClassForm from "../../components/Forms/AddForms/AddMaterialClassForm";
import MaterialClassTable from "../../components/Tables/MaterialClassTable";

const MaterialClassesPage = () => {
  return (
    <div>
      <ModalButton buttonName={"Yeni malzeme sınıfı ekle"}>
        <AddMaterialClassForm />
      </ModalButton>
      <MaterialClassTable />
    </div>
  );
};

export default MaterialClassesPage;
