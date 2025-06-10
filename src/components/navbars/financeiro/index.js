import React from "react";
import ButtonComponent from "../../button";
import { useNavigate } from "react-router-dom";
import { People, Person, Work } from "@mui/icons-material";

const HeaderFinanceiro = () => {
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("user"));
  const userType = userData?.tipo;

  const handleNavigation = (section) => {
    switch (section) {
      case "palestras-cursos":
        navigate("/financeiro/palestras-cursos");
        break;
      case "prestadores":
        navigate("/financeiro/prestadores");
        break;
      case "aide":
        navigate("/financeiro/aide");
        break;

      default:
        console.warn(`Seção desconhecida: ${section}`);
        break;
    }
  };

  return (
    <div className=" w-[100%] items-center justify-center flex flex-wrap lg:justify-start gap-2 md:gap-1">
      <ButtonComponent
        startIcon={<Work fontSize="small" />}
        title="Aidê"
        buttonSize="large"
        onClick={() => handleNavigation("aide")}
        className="w-[35%] sm:w-[50%] md:w-[40%] lg:w-[100%]"
      />

      <ButtonComponent
        startIcon={<Person fontSize="small" />}
        title="Palestras Cursos"
        buttonSize="large"
        onClick={() => handleNavigation("palestras-cursos")}
        className="w-[35%] sm:w-[50%] md:w-[40%] lg:w-[100%]"
      />

      <ButtonComponent
        startIcon={<People fontSize="small" />}
        title="Prestadores"
        buttonSize="large"
        onClick={() => handleNavigation("prestadores")}
        className="w-[35%] sm:w-[50%] md:w-[40%] lg:w-[100%]"
      />
    </div>
  );
};

export default HeaderFinanceiro;
