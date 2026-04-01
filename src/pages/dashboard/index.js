import Navbar from "../../components/navbars/header";
import HeaderPerfil from "../../components/navbars/perfil";
import MenuMobile from "../../components/menu-mobile";
import Imagem01 from "../../assets/png/palestra.png";
import Imagem02 from "../../assets/png/atendimentos.png";
import Imagem03 from "../../assets/jpeg/dinheiro.jpg";
import Imagem04 from "../../assets/png/prestadores.png";
import { buscarPalestraCurso } from "../../service/get/palestra-curso";
import { buscarContasReceber } from "../../service/get/contas-receber";
import { buscarRelatorioPretadores } from "../../service/get/relatorio-prestador";
import { useEffect, useState } from "react";
import CustomToast from "../../components/toast";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
);

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const [prestadores, setPrestadores] = useState([]);
  const [atendimentosCount, setAtendimentosCount] = useState(0);
  const [palestras, setPalestras] = useState([]);
  const [palestrasCount, setPalestrasCount] = useState(0);
  const [valorReceber, setValorReceber] = useState(0);
  const [valorPalestrasPagas, setValorPalestrasPagas] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const buscarContasAReceber = async () => {
    try {
      const response = await buscarContasReceber();
      const dados = response.data || response.data?.data || response;
      return dados;
    } catch (error) {
      console.error("Erro detalhado:", {
        message: error.message,
        response: error.response,
        stack: error.stack,
      });
      CustomToast({
        type: "error",
        message: error.response?.data?.message || "Erro ao buscar contas",
      });
      return null;
    }
  };

  const buscarServicosPrestador = async () => {
    try {
      const response = await buscarRelatorioPretadores();
      const data = response.data || [];
      setPrestadores(Array.isArray(data) ? data : []);
    } catch (error) {
      const errorMessage = error.response?.data?.errors?.nome;
      CustomToast({
        type: "error",
        message: errorMessage || "Erro ao buscar tipos de palestra",
      });
      setPrestadores([]);
    }
  };

  const buscarPalestrasCursos = async () => {
    try {
      const response = await buscarPalestraCurso();
      const data = response.data || [];
      setPalestras(Array.isArray(data) ? data : []);
    } catch (error) {
      const errorMessage = error.response?.data?.errors?.nome;
      CustomToast({
        type: "error",
        message: errorMessage || "Erro ao buscar tipos de palestra",
      });
      setPalestras([]);
    }
  };

  useEffect(() => {
    const carregarDados = async () => {
      setIsLoading(true);
      await Promise.all([
        buscarServicosPrestador(),
        buscarPalestrasCursos(),
        buscarContasAReceber(),
      ]);
      setIsLoading(false);
    };
    carregarDados();
  }, []);

  useEffect(() => {
    if (prestadores.length > 0) {
      setAtendimentosCount(prestadores.length);

      let totalComissoesPagas = 0;
      prestadores.forEach((prestador) => {
        if (prestador.servicos && Array.isArray(prestador.servicos)) {
          prestador.servicos.forEach((servico) => {
            if (servico.parcelas && Array.isArray(servico.parcelas)) {
              servico.parcelas.forEach((parcela) => {
                if (parcela.status_pagamento_comissao === 1) {
                  totalComissoesPagas +=
                    parseFloat(parcela.valor_comissao) || 0;
                }
              });
            }
          });
        }
      });
      setValorReceber(totalComissoesPagas);
    }

    if (palestras.length > 0) {
      setPalestrasCount(palestras.length);

      let totalPalestrasPagas = 0;
      palestras.forEach((palestra) => {
        if (palestra.parcelas && Array.isArray(palestra.parcelas)) {
          palestra.parcelas.forEach((parcela) => {
            if (parcela.status_pagamento === "2") {
              totalPalestrasPagas += parseFloat(parcela.valor) || 0;
            }
          });
        }
      });
      setValorPalestrasPagas(totalPalestrasPagas);
    }
  }, [prestadores, palestras]);

  const processarDadosTiposPalestras = () => {
    if (!Array.isArray(palestras) || palestras.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: [],
            borderColor: [],
            borderWidth: 1,
          },
        ],
      };
    }

    const contagemTipos = {};

    palestras.forEach((palestra) => {
      const tipoNome = palestra.tipoPalestra?.nome || "Sem tipo";
      contagemTipos[tipoNome] = (contagemTipos[tipoNome] || 0) + 1;
    });

    const tiposOrdenados = Object.entries(contagemTipos)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const labels = tiposOrdenados.map((item) => item[0]);
    const data = tiposOrdenados.map((item) => item[1]);

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: [
            "rgba(157, 75, 91, 0.7)",
            "rgba(75, 192, 192, 0.7)",
            "rgba(255, 206, 86, 0.7)",
            "rgba(54, 162, 235, 0.7)",
            "rgba(153, 102, 255, 0.7)",
          ],
          borderColor: [
            "rgba(157, 75, 91, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(153, 102, 255, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const opcoesGrafico = {
    responsive: true,
    plugins: {
      legend: {
        position: "right",
      },
      title: {
        display: true,
        text: "Top 5 Tipos de Palestras Mais Realizadas",
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage =
              total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  const processarDadosServicos = () => {
    if (!Array.isArray(prestadores) || prestadores.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            label: "Quantidade de Serviços",
            data: [],
            backgroundColor: "rgba(157, 75, 91, 0.7)",
            borderColor: "rgba(157, 75, 91, 1)",
            borderWidth: 1,
          },
        ],
      };
    }

    const contagemServicos = {};

    prestadores.forEach((prestador) => {
      if (prestador.servicos && Array.isArray(prestador.servicos)) {
        prestador.servicos.forEach((servico) => {
          const servicoNome =
            servico.servico?.nome || "Serviço não identificado";
          contagemServicos[servicoNome] =
            (contagemServicos[servicoNome] || 0) + 1;
        });
      }
    });

    const servicosOrdenados = Object.entries(contagemServicos)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const labels = servicosOrdenados.map((item) => item[0]);
    const data = servicosOrdenados.map((item) => item[1]);

    return {
      labels,
      datasets: [
        {
          label: "Quantidade de Serviços",
          data,
          backgroundColor: "rgba(157, 75, 91, 0.7)",
          borderColor: "rgba(157, 75, 91, 1)",
          borderWidth: 1,
        },
      ],
    };
  };

  const opcoesGraficoServicos = {
    indexAxis: "x",
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Top 5 Serviços Mais Realizados",
        font: {
          size: 14,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: {
            size: 10,
          },
        },
        grid: {
          display: false,
        },
      },
      x: {
        ticks: {
          font: {
            size: 10,
          },
        },
      },
    },
    barPercentage: 0.6,
    categoryPercentage: 0.8,
  };

  if (isLoading) {
    return (
      <div className="lg:flex w-[100%] h-[100%]">
        <MenuMobile />
        <Navbar />
        <div className="flex flex-col gap-2 w-full items-end">
          <HeaderPerfil />
          <div className="flex items-center justify-center w-full h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-primary">Carregando dados...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:flex w-[100%] h-[100%]">
      <MenuMobile />
      <Navbar />
      <div className="flex flex-col gap-2 w-full items-end">
        <HeaderPerfil />

        <div className="items-center justify-center lg:justify-start w-full flex mt-[60px] gap-2 flex-wrap md:items-start pl-2">
          <div className="w-full flex items-center justify-center flex-col gap-4">
            <div className="w-[100%] flex items-center flex-wrap justify-center"></div>
            <div className="w-[100%] flex items-center gap-3 justify-center flex-wrap">
              <div className="flex items-center gap-4 justify-center flex-wrap w-[80%] md:w-[18%]">
                <div
                  className="flex items-center justify-center gap-4 w-[100%] p-4"
                  style={{ border: "1px solid #9D4B5B", borderRadius: "10px" }}
                >
                  <img
                    src={Imagem01}
                    style={{ width: "45%" }}
                    alt="Palestras"
                  />
                  <div className="flex flex-col gap-3 w-[55%]">
                    <label className="text-xs w-full text-center font-bold text-primary">
                      Nº de Palestras
                    </label>
                    <label className="text-xs font-bold w-full text-primary text-center">
                      {palestrasCount}
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 justify-center flex-wrap w-[80%] md:w-[18%]">
                <div
                  className="flex items-center justify-center gap-4 w-[100%] p-4"
                  style={{ border: "1px solid #9D4B5B", borderRadius: "10px" }}
                >
                  <img
                    src={Imagem02}
                    style={{ width: "45%" }}
                    alt="Atendimentos"
                  />
                  <div className="flex flex-col gap-3 w-[55%]">
                    <label className="text-xs w-full text-center font-bold text-primary">
                      Atendimentos
                    </label>
                    <label className="text-xs font-bold w-full text-primary text-center">
                      {atendimentosCount}
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 justify-center flex-wrap w-[80%] md:w-[18%]">
                <div
                  className="flex items-center justify-center gap-4 w-[100%] p-4"
                  style={{ border: "1px solid #9D4B5B", borderRadius: "10px" }}
                >
                  <img
                    src={Imagem03}
                    style={{ width: "45%" }}
                    alt="Comissões"
                  />
                  <div className="flex flex-col gap-3 w-[55%]">
                    <label className="text-xs text-center w-full font-bold text-primary">
                      Comissões Recebidas
                    </label>
                    <label className="text-xs font-bold w-full text-primary text-center">
                      {valorReceber > 0
                        ? valorReceber.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })
                        : "R$ 0,00"}
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 justify-center flex-wrap w-[80%] md:w-[18%]">
                <div
                  className="flex items-center justify-center gap-4 w-[100%] p-4"
                  style={{ border: "1px solid #9D4B5B", borderRadius: "10px" }}
                >
                  <img
                    src={Imagem04}
                    style={{ width: "45%" }}
                    alt="Palestras Pagas"
                  />
                  <div className="flex flex-col gap-3 w-[55%]">
                    <label className="text-xs text-center w-full font-bold text-primary">
                      Palestras
                    </label>
                    <label className="text-xs font-bold w-full text-primary text-center">
                      {valorPalestrasPagas > 0
                        ? valorPalestrasPagas.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })
                        : "R$ 0,00"}
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full flex flex-col items-center mt-0 px-4">
              <div className="w-full flex itens-center mt-4 justify-center gap-4 flex-wrap">
                <div className="w-[90%] md:w-[40%] flex itens-center h-[300px] justify-center">
                  <Pie
                    style={{ color: "#9D4B5B" }}
                    data={processarDadosTiposPalestras()}
                    options={{
                      ...opcoesGrafico,
                      maintainAspectRatio: false,
                      aspectRatio: 1.5,
                    }}
                    height={300}
                  />
                </div>
                <div className="w-[90%] md:w-[45%] flex itens-center justify-center">
                  <Bar
                    data={processarDadosServicos()}
                    options={opcoesGraficoServicos}
                    height={200}
                  />
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
