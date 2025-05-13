import ButtonComponent from '../../button';
import { useNavigate } from 'react-router-dom';
import FacebookIcon from '@mui/icons-material/Facebook';
import AddCardIcon from '@mui/icons-material/AddCard';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

const HeaderCursos = () => {
    const navigate = useNavigate();
    const userData = JSON.parse(localStorage.getItem('user'));
    const userType = userData?.tipo;

    const handleNavigation = (section) => {
        switch (section) {
            case 'fFacebook':
                navigate('/cursos/facebook');
                break;
            case 'mercado-livre':
                navigate('/cursos/mercado-livre');
                break;
            case 'whatsapp':
                navigate('/cursos/whatsapp');
                break;

            default:
                console.warn(`Seção desconhecida: ${section}`);
                break;
        }
    };

    return (
        <div className="w-[100%] items-center justify-center flex flex-wrap lg:justify-start gap-2 md:gap-1">

            {userType === 1 && (
                <>
                    <ButtonComponent
                        startIcon={<FacebookIcon fontSize="small" />}
                        title="Facebook"
                        buttonSize="large"
                        onClick={() => handleNavigation('facebook')}
                        className="w-[35%] sm:w-[50%] md:w-[40%] lg:w-[100%]"
                    />
                    <ButtonComponent
                        startIcon={<AddCardIcon fontSize="small" />}
                        title="Mercado Livre"
                        buttonSize="large"
                        onClick={() => handleNavigation('mercado-livre')}
                        className="w-[35%] sm:w-[50%] md:w-[40%] lg:w-[100%]"
                    />
                    <ButtonComponent
                        startIcon={<WhatsAppIcon fontSize="small" />}
                        title="WhatsApp"
                        buttonSize="large"
                        onClick={() => handleNavigation('whatsapp')}
                        className="w-[35%] sm:w-[50%] md:w-[40%] lg:w-[100%]"
                    />
                </>
            )}


        </div>
    );
};

export default HeaderCursos;