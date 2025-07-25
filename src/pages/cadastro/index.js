import React, { useEffect, useState } from "react";
import MenuMobile from "../../components/menu-mobile";
import HeaderPerfil from "../../components/navbars/perfil";
import HeaderCadastro from "../../components/navbars/cadastro";
import CadastroImagem from "../../assets/png/cadastro.png";
import Navbar from "../../components/navbars/header";
import { motion } from "framer-motion";

const Cadastro = () => {
  const [efeito, setEfeito] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setEfeito(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };
  return (
    <div className="flex w-full ">
      <Navbar />

      <div className="flex ml-0 flex-col gap-3 w-full items-end ">
        <MenuMobile />
        <motion.div
          style={{ width: "100%" }}
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.9 }}
        >
          <HeaderPerfil pageTitle="Cadastro" />

          <div className=" items-center justify-center lg:justify-start w-full flex mt-[95px] gap-2 flex-wrap md:items-start pl-2">
            <div className="w-[100%] md:w-[60%] lg:w-[14%]">
              <HeaderCadastro />
            </div>
            <div
              className={`w-[100%] lg:w-[80%] flex-col flex items-center justify-center transition-opacity duration-500 ${
                efeito ? "opacity-100" : "opacity-0 translate-y-4"
              }`}
            >
              <img className="w-[30%]" src={CadastroImagem} alt="Cadastro" />
              <h1 className="font-bold text-primary">
                Selecione uma opção do menu!
              </h1>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Cadastro;
