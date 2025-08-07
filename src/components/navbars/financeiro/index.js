import React from "react";
import ButtonComponent from "../../button";
import { useNavigate } from "react-router-dom";
import { MonetizationOn, People, Person } from "@mui/icons-material";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";

const HeaderFinanceiro = () => {
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("user"));
  const userType = userData?.tipo;

  const handleNavigation = (section) => {
    switch (section) {
      case "contas-receber":
        navigate("/financeiro/contas-receber");
        break;
      case "contas-pagar":
        navigate("/financeiro/contas-pagar");
        break;
      case "palestras-cursos":
        navigate("/financeiro/palestras-cursos");
        break;
      case "prestadores":
        navigate("/financeiro/prestadores");
        break;
      case "fluxo-caixa":
        navigate("/financeiro/fluxo-caixa");
        break;

      default:
        console.warn(`Seção desconhecida: ${section}`);
        break;
    }
  };

  return (
    <div className=" w-[100%] items-center justify-center flex flex-wrap lg:justify-start gap-2 md:gap-1">
      <ButtonComponent
        startIcon={<PointOfSaleIcon fontSize="small" />}
        title="Contas à Pagar"
        buttonSize="large"
        onClick={() => handleNavigation("contas-pagar")}
        className="w-[35%] sm:w-[50%] md:w-[40%] lg:w-[100%]"
      />
      <ButtonComponent
        startIcon={<CurrencyExchangeIcon fontSize="small" />}
        title="Contas à Receber"
        buttonSize="large"
        onClick={() => handleNavigation("contas-receber")}
        className="w-[35%] sm:w-[50%] md:w-[40%] lg:w-[100%]"
      />
      <ButtonComponent
        startIcon={<MonetizationOn fontSize="small" />}
        title="Fluxo de Caixa"
        buttonSize="large"
        onClick={() => handleNavigation("fluxo-caixa")}
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
