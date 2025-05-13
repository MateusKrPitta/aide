import Navbar from '../../components/navbars/header';
import HeaderPerfil from '../../components/navbars/perfil';
import MenuMobile from '../../components/menu-mobile';

const Dashboard = () => {
   
    return (
        <div className="lg:flex w-[100%] h-[100%]">
            <MenuMobile />
            <Navbar />
            <div className='flex flex-col gap-2 w-full items-end'>
                <HeaderPerfil />
                

                
            </div>
        </div>
    );
}

export default Dashboard;