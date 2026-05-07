import axios from 'axios'
import $ from 'jquery'
import { useAuth } from '../contexts/authContext';

function Login() {

    if (localStorage.getItem('h') != null){
        document.location.replace('/')
    }
    

    const { setIsLogged } = useAuth();
    async function handleLogin(event){
        event.preventDefault()
        console.log(event)

        let form = $(event.target).serializeArray()
        axios.post('/api/login', {email: form[0].value, senha: form[1].value}).then(function(resp){
            if (resp.data.t){
                localStorage.setItem('h', resp.data.t)
                localStorage.setItem('user_name', resp.data.user_name)
                setIsLogged(true)
            }
        })
    }
  return (
    <>
        <div className="grid grid-cols-3 gap-3">
            <div></div>
            <div className="rounded-lg bg-gray-100 shadow-md p-2">
                <p className="text-3xl">Fazer login</p>
                <form onSubmit={handleLogin}>
                    <div className="">
                        <label htmlFor="usuario">Email</label><br />
                        <input type="text" placeholder="Email" name="email" className="border-2 border-blue-400 rounded-md"/>
                    </div>
                    <div>
                        <label htmlFor="senha">Senha</label><br />
                        <input type="password" placeholder="Senha" name="senha" className="border-2 border-blue-400 rounded-md"/>
                    </div>
                    <div>
                        <button type="submit" className="px-4 py-2 font-semibold text-sm bg-blue-400 text-white rounded-full shadow-sm">Fazer login</button>
                    </div>
                    
                </form>
            </div>
            <div></div>
        </div>

    </>
  );
}

export default Login;