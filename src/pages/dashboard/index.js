import Navbar from "../../components/navbars/header";
import HeaderPerfil from "../../components/navbars/perfil";
import MenuMobile from "../../components/menu-mobile";
import { InputAdornment, TextField } from "@mui/material";
import { DateRange, Search } from "@mui/icons-material";
import Imagem01 from "../../assets/png/palestra.png";
import Imagem02 from "../../assets/png/atendimentos.png";
import Imagem03 from "../../assets/jpeg/dinheiro.jpg";
import Imagem04 from "../../assets/png/prestadores.png";
import Imagem05 from "../../assets/png/pendente.png";
import ButtonComponent from "../../components/button";

const Dashboard = () => {
  return (
    <div className="lg:flex w-[100%] h-[100%]">
      <MenuMobile />
      <Navbar />
      <div className="flex flex-col gap-2 w-full items-end">
        <HeaderPerfil />

        <div className=" items-center justify-center lg:justify-start w-full flex mt-[60px] gap-2 flex-wrap md:items-start pl-2">
          <div className="w-full flex items-center justify-center flex-col gap-4">
            <div className="w-[100%] flex items-center flex-wrap justify-center">
              <div className="w-full justify-center flex items-center gap-3 md:w-[50%] flex-wrap">
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  type="date"
                  label="Data Início"
                  autoComplete="off"
                  sx={{ width: { xs: "63%", sm: "50%", md: "40%", lg: "30%" } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DateRange />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  type="date"
                  label="Data Fim"
                  autoComplete="off"
                  sx={{ width: { xs: "63%", sm: "50%", md: "40%", lg: "30%" } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DateRange />
                      </InputAdornment>
                    ),
                  }}
                />
                <ButtonComponent
                  title={"Pesquisar"}
                  subtitle={"Pesquisar"}
                  startIcon={<Search fontSize="small" />}
                  buttonSize="large"
                />
              </div>
            </div>
            <div className="w-[100%] flex items-center gap-3 justify-center flex-wrap">
              <div className="flex items-center gap-4 justify-center flex-wrap w-[80%] md:w-[18%]">
                <div
                  className="flex items-center justify-center gap-4 w-[100%] p-4"
                  style={{ border: "1px solid #9D4B5B", borderRadius: "10px" }}
                >
                  <img src={Imagem01} style={{ width: "45%" }}></img>
                  <div className="flex flex-col gap-3 w-[55%]">
                    <label className="text-xs w-full text-center font-bold text-primary">
                      Palestras
                    </label>
                    <label className="text-xs font-bold w-full text-primary text-center">
                      25
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 justify-center flex-wrap w-[80%] md:w-[18%]">
                <div
                  className="flex items-center justify-center gap-4 w-[100%]  p-4"
                  style={{ border: "1px solid #9D4B5B", borderRadius: "10px" }}
                >
                  <img src={Imagem02} style={{ width: "45%" }}></img>
                  <div className="flex flex-col gap-3 w-[55%]">
                    <label className="text-xs w-full text-center font-bold text-primary">
                      Atendimentos
                    </label>
                    <label className="text-xs font-bold w-full text-primary text-center">
                      25
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 justify-center flex-wrap w-[80%] md:w-[18%]">
                <div
                  className="flex items-center justify-center gap-4 w-[100%]  p-4"
                  style={{ border: "1px solid #9D4B5B", borderRadius: "10px" }}
                >
                  <img src={Imagem03} style={{ width: "45%" }}></img>
                  <div className="flex flex-col gap-3 w-[55%]">
                    <label className="text-xs w-full text-center font-bold text-primary">
                      Valor à Receber
                    </label>
                    <label className="text-xs font-bold w-full text-primary text-center">
                      R$ 250,00
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 justify-center flex-wrap w-[80%] md:w-[18%]">
                <div
                  className="flex items-center justify-center gap-4 w-[100%]  p-4"
                  style={{ border: "1px solid #9D4B5B", borderRadius: "10px" }}
                >
                  <img src={Imagem04} style={{ width: "45%" }}></img>
                  <div className="flex flex-col gap-3 w-[55%]">
                    <label className="text-xs text-center w-full font-bold text-primary">
                      Prestadores Pagos
                    </label>
                    <label className="text-xs font-bold w-full text-primary text-center">
                      R$ 500,00
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 justify-center flex-wrap w-[80%] md:w-[18%]">
                <div
                  className="flex items-center justify-center gap-4 w-[100%]  p-4"
                  style={{ border: "1px solid #9D4B5B", borderRadius: "10px" }}
                >
                  <img src={Imagem05} style={{ width: "45%" }}></img>
                  <div className="flex flex-col gap-3 w-[55%]">
                    <label className="text-xs text-center w-full font-bold text-primary">
                      Pagamentos Pendentes
                    </label>
                    <label className="text-xs font-bold w-full text-primary text-center">
                      25
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
