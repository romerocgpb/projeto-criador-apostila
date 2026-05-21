import { useState, useEffect } from 'react';
import axios from 'axios';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import ImageUploader from './ImageUploader';

function ConteudoPrincipal({chatAtivo}){
    const [loading, setLoading] = useState(false)
    const [chatState, setChatState] = useState({})
    useEffect(function(){
        setLoading(true);
        async function carregaHistoricoApostila() {
            
            try {
                const resp = await axios.post('/api/apostilas/load', {ap_uuid: chatAtivo}, {headers: {
                    authorization: localStorage.getItem('h')
                }});
                console.log(resp.status)
                setChatState(resp.data);
            } catch (error) {
                console.log(error)
            }

            

        };
        carregaHistoricoApostila();
        setLoading(false);
    }, [chatAtivo])

    if (loading){
        return (<p className='flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-800 text-white'><span><FontAwesomeIcon icon={faSpinner} className='animate-spin text-gray-400 text-xl' />Carregando...</span></p>)
    }

    return (
        <>
            <p>Carregado! {chatAtivo}</p>
            <ImageUploader chatAtivo={chatAtivo}/>
        </>
    )
}

export default ConteudoPrincipal