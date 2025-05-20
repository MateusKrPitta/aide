import React, { useState, useEffect } from "react";
import Navbar from '../../../components/navbars/header';
import HeaderPerfil from '../../../components/navbars/perfil';
import ButtonComponent from '../../../components/button';
import HeaderCadastro from '../../../components/navbars/cadastro';
import CentralModal from '../../../components/modal-central';
import Checkbox from '@mui/material/Checkbox';
import MenuMobile from "../../../components/menu-mobile";
import ModalLateral from "../../../components/modal-lateral";
import { Edit, Numbers, Phone, Work, } from '@mui/icons-material';
import { FormControlLabel, IconButton, InputAdornment, TextField } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import NotesIcon from '@mui/icons-material/Notes';
import { Password } from "@mui/icons-material";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { motion } from 'framer-motion';
import TableLoading from "../../../components/loading/loading-table/loading";
import TableComponent from "../../../components/table";
import { usuarioCadastrados } from "../../../entities/header/usuario";
const Usuario = () => {

    const [editando, setEditando] = useState(false);
    const [loading, setLoading] = useState(false);
    const [cadastroUsuario, setCadastroUsuario] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [permissao, setPermissao] = useState(null);

    const [nomeCompleto, setNomeCompleto] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [listaUsuarios , setListaUsuarios ] = useState([
{
        nome: "João Silva",
        cpf: "123.456.789-00",
        telefone: "(11) 99999-9999",
        tipo: "Administrador"
    },
    {
        nome: "Maria Oliveira",
        cpf: "987.654.321-00",
        telefone: "(11) 98888-8888",
        tipo: "Funcionário"
    },
    {
        nome: "Carlos Souza",
        cpf: "456.789.123-00",
        telefone: "(11) 97777-7777",
        tipo: "Cliente"
    },
    {
        nome: "Ana Pereira",
        cpf: "789.123.456-00",
        telefone: "(11) 96666-6666",
        tipo: "Funcionário"
    },
    {
        nome: "Pedro Costa",
        cpf: "321.654.987-00",
        telefone: "(11) 95555-5555",
        tipo: "Cliente"
    }
    ]);

    const FecharCadastroUsuario = () => {
        setCadastroUsuario(false);
    };








    const handleCloseEdicao = () => {
        setEditando(false);
    };

    const EditarOpcao = () => {
        setEditando(true);
    };







    const fadeIn = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
    };

    return (
        <div className="flex w-full ">
            <Navbar />
            <div className='flex ml-0 flex-col gap-3 w-full items-end md:ml-0 '>
                <MenuMobile />
                <motion.div
                    style={{ width: '100%' }}
                    initial="hidden"
                    animate="visible"
                    variants={fadeIn}
                    transition={{ duration: 0.9 }}
                >
                    <HeaderPerfil pageTitle="Usuário" />

                    <div className=" items-center justify-center lg:justify-start w-full flex mt-[95px] gap-2 flex-wrap md:items-start pl-2">
                        <div className='w-[100%] md:w-[60%] lg:w-[14%]'>
                            <HeaderCadastro />
                        </div>
                        <div className="w-[100%] itens-center mt-2 ml-2 sm:mt-0 md:flex md:justify-start flex-col lg:w-[80%]">
                            <div className="flex gap-2 flex-wrap w-full justify-center md:justify-start">
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    label="Buscar usuário"
                                    autoComplete="off"

                                    sx={{ width: { xs: '72%', sm: '50%', md: '40%', lg: '40%' } }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <ButtonComponent
                                    startIcon={<AddCircleOutlineIcon fontSize='small' />}
                                    title={'Cadastrar'}
                                    subtitle={'Cadastrar'}
                                    buttonSize="large"
                                    onClick={() => setCadastroUsuario(true)}
                                />
                            </div>
                            <div className='w-full flex'>
                                {loading ? (
                                    <TableLoading />
                                ) : listaUsuarios.length > 0 ? (
                                    <TableComponent
                                        headers={usuarioCadastrados}
                                        rows={listaUsuarios}
                                        actionsLabel={"Ações"}
                                        actionCalls={{
                                            edit: EditarOpcao,
                                            inactivate: '',
                                        }}
                                    />
                                ) : (
                                    <div className="text-center flex items-center mt-28 justify-center gap-5 flex-col text-primary">
                                        <TableLoading />
                                        <label className="text-sm">Serviço não encontrado!</label></div>
                                )}
                            </div>



                            <CentralModal
                                tamanhoTitulo={'81%'}
                                maxHeight={'90vh'}
                                top={'20%'}
                                left={'28%'}
                                width={'620px'}
                                icon={<AddCircleOutlineIcon fontSize="small" />}
                                open={cadastroUsuario}
                                onClose={FecharCadastroUsuario}
                                title="Cadastrar Usuário"
                            >
                                <div className="overflow-y-auto overflow-x-hidden max-h-[300px]">
                                    <div className='mt-4 flex gap-3 flex-wrap'>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            size="small"
                                            label="Nome Completo"
                                            name="nome"
                                            value={nomeCompleto}
                                            onChange={(e) => setNomeCompleto(e.target.value)}
                                            autoComplete="off"
                                            sx={{ width: { xs: '100%', sm: '50%', md: '40%', lg: '47%' } }}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <PersonIcon />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            size="small"
                                            label="Email"
                                            name="Email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            autoComplete="off"
                                            sx={{ width: { xs: '48%', sm: '43%', md: '45%', lg: '47%' } }}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <NotesIcon />
                                                    </InputAdornment>
                                                ),

                                            }}
                                        />
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            size="small"
                                            type="password"
                                            label="Senha"
                                            name="senha"
                                            value={senha}
                                            onChange={(e) => setSenha(e.target.value)}
                                            autoComplete="off"
                                            sx={{ width: { xs: '48%', sm: '40%', md: '40%', lg: '47%' } }}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Password />
                                                    </InputAdornment>
                                                ),

                                            }}
                                        />
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            size="small"
                                            label="Telefone"
                                            name="telefone"

                                            autoComplete="off"
                                            sx={{ width: { xs: '100%', sm: '50%', md: '40%', lg: '47%' } }}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Phone />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            size="small"
                                            label="CEP"
                                            name="cep"

                                            autoComplete="off"
                                            sx={{ width: { xs: '100%', sm: '50%', md: '40%', lg: '47%' } }}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <LocationOnIcon />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            size="small"
                                            label="Estado"
                                            name="estado"

                                            autoComplete="off"
                                            sx={{ width: { xs: '100%', sm: '50%', md: '40%', lg: '47%' } }}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <LocationOnIcon />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            size="small"
                                            label="Cidade"
                                            name="cidade"

                                            autoComplete="off"
                                            sx={{ width: { xs: '100%', sm: '50%', md: '40%', lg: '47%' } }}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <LocationOnIcon />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            size="small"
                                            label="Bairro"
                                            name="Bairro"

                                            autoComplete="off"
                                            sx={{ width: { xs: '100%', sm: '50%', md: '40%', lg: '47%' } }}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <LocationOnIcon />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            size="small"
                                            label="Rua"
                                            name="Rua"

                                            autoComplete="off"
                                            sx={{ width: { xs: '100%', sm: '50%', md: '40%', lg: '47%' } }}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <LocationOnIcon />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            size="small"
                                            label="Número"
                                            name="numero"
                                            type="number"
                                            autoComplete="off"
                                            sx={{ width: { xs: '100%', sm: '50%', md: '40%', lg: '47%' } }}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Numbers />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            size="small"
                                            label="Serviço"
                                            name="servico"
                                            autoComplete="off"
                                            sx={{ width: { xs: '100%', sm: '50%', md: '40%', lg: '47%' } }}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Work />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />

                                    </div>


                                    <div className="w-full flex items-center mt-4 ml-2 font-bold mb-1">
                                        <label className="w-[70%] text-xs">Permissão</label>
                                    </div>
                                    <div className="flex flex-col gap-1 w-[95%]  border-[1px] p-3 rounded-lg">
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    size="small"
                                                    checked={permissao === 1}
                                                    onChange={() => setPermissao(1)}
                                                />
                                            }
                                            label="Administrador"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    size="small"
                                                    checked={permissao === 2}
                                                    onChange={() => setPermissao(2)}
                                                />
                                            }
                                            label="Cliente"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    size="small"
                                                    checked={permissao === 3}
                                                    onChange={() => setPermissao(3)}
                                                />
                                            }
                                            label="Funcionário"
                                        />
                                    </div>
                                    <div className="flex w-[96%] items-end justify-end mt-2 ">
                                        <ButtonComponent
                                            startIcon={<AddCircleOutlineIcon fontSize='small' />}
                                            title={'Cadastrar'}
                                            subtitle={'Cadastrar'}
                                            // onClick={CadastrarUsuario}
                                            buttonSize="large"
                                        />
                                    </div>
                                </div>
                            </CentralModal>

                            <ModalLateral
                                open={editando}
                                handleClose={handleCloseEdicao}
                                tituloModal="Editar Usuário"
                                icon={<Edit />}
                                tamanhoTitulo="75%"
                                conteudo={
                                    <div className="">
                                        <div className='mt-4 flex gap-3 flex-wrap'>
                                            <TextField
                                                fullWidth
                                                variant="outlined"
                                                size="small"
                                                label="Nome Completo"
                                                name="nome"
                                                value={nomeCompleto}
                                                onChange={(e) => setNomeCompleto(e.target.value)}
                                                autoComplete="off"
                                                sx={{ width: { xs: '100%', sm: '50%', md: '40%', lg: '47%' } }}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <PersonIcon />
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                            <TextField
                                                fullWidth
                                                variant="outlined"
                                                size="small"
                                                label="Email"
                                                name="Email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                autoComplete="off"
                                                sx={{ width: { xs: '48%', sm: '43%', md: '45%', lg: '47%' } }}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <NotesIcon />
                                                        </InputAdornment>
                                                    ),

                                                }}
                                            />
                                            <TextField
                                                fullWidth
                                                variant="outlined"
                                                size="small"
                                                type="password"
                                                label="Senha"
                                                name="senha"
                                                value={senha}
                                                onChange={(e) => setSenha(e.target.value)}
                                                autoComplete="off"
                                                sx={{ width: { xs: '48%', sm: '40%', md: '40%', lg: '47%' } }}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <Password />
                                                        </InputAdornment>
                                                    ),

                                                }}
                                            />
                                            <TextField
                                                fullWidth
                                                variant="outlined"
                                                size="small"
                                                label="Telefone"
                                                name="telefone"

                                                autoComplete="off"
                                                sx={{ width: { xs: '100%', sm: '50%', md: '40%', lg: '47%' } }}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <Phone />
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                            <TextField
                                                fullWidth
                                                variant="outlined"
                                                size="small"
                                                label="CEP"
                                                name="cep"

                                                autoComplete="off"
                                                sx={{ width: { xs: '100%', sm: '50%', md: '40%', lg: '47%' } }}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <LocationOnIcon />
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                            <TextField
                                                fullWidth
                                                variant="outlined"
                                                size="small"
                                                label="Estado"
                                                name="estado"

                                                autoComplete="off"
                                                sx={{ width: { xs: '100%', sm: '50%', md: '40%', lg: '47%' } }}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <LocationOnIcon />
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                            <TextField
                                                fullWidth
                                                variant="outlined"
                                                size="small"
                                                label="Cidade"
                                                name="cidade"

                                                autoComplete="off"
                                                sx={{ width: { xs: '100%', sm: '50%', md: '40%', lg: '47%' } }}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <LocationOnIcon />
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                            <TextField
                                                fullWidth
                                                variant="outlined"
                                                size="small"
                                                label="Bairro"
                                                name="Bairro"

                                                autoComplete="off"
                                                sx={{ width: { xs: '100%', sm: '50%', md: '40%', lg: '47%' } }}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <LocationOnIcon />
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                            <TextField
                                                fullWidth
                                                variant="outlined"
                                                size="small"
                                                label="Rua"
                                                name="Rua"

                                                autoComplete="off"
                                                sx={{ width: { xs: '100%', sm: '50%', md: '40%', lg: '47%' } }}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <LocationOnIcon />
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                            <TextField
                                                fullWidth
                                                variant="outlined"
                                                size="small"
                                                label="Número"
                                                name="numero"
                                                type="number"
                                                autoComplete="off"
                                                sx={{ width: { xs: '100%', sm: '50%', md: '40%', lg: '47%' } }}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <Numbers />
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                            <TextField
                                                fullWidth
                                                variant="outlined"
                                                size="small"
                                                label="Serviço"
                                                name="servico"
                                                autoComplete="off"
                                                sx={{ width: { xs: '100%', sm: '50%', md: '40%', lg: '47%' } }}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <Work />
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />

                                        </div>


                                        <div className="w-full flex items-center mt-4 ml-2 font-bold mb-1">
                                            <label className="w-[70%] text-xs">Permissão</label>
                                        </div>
                                        <div className="flex flex-col gap-1 w-[95%]  border-[1px] p-3 rounded-lg">
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        size="small"
                                                        checked={permissao === 1}
                                                        onChange={() => setPermissao(1)}
                                                    />
                                                }
                                                label="Administrador"
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        size="small"
                                                        checked={permissao === 2}
                                                        onChange={() => setPermissao(2)}
                                                    />
                                                }
                                                label="Cliente"
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        size="small"
                                                        checked={permissao === 3}
                                                        onChange={() => setPermissao(3)}
                                                    />
                                                }
                                                label="Funcionário"
                                            />
                                        </div>

                                        <div className="flex w-[96%] items-end justify-end mt-2 ">
                                            <ButtonComponent
                                                startIcon={<AddCircleOutlineIcon fontSize='small' />}
                                                title={'Salvar'}
                                                subtitle={'Salvar'}
                                                buttonSize="large"
                                            //onClick={EditarUsuario}
                                            />
                                        </div>
                                    </div>
                                }
                            />
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export default Usuario;