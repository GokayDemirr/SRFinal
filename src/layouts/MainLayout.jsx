import Sidebar from "../components/Sidebar/Sidebar";
import Header from "../components/Header/Header";

const MainLayout = ({ children }) => {
  return (
    <div className="flex-col h-screen">
      <Header />

      <div className="flex">
        <Sidebar />

        <main className="flex-grow ">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
