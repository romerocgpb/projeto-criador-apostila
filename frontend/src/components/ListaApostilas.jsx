import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import $ from "jquery"

import axios from 'axios';

function ListaApostilas({isOpen, chatAtivo, setChatAtivo}){
    const [loading, setLoading] = useState(true)
    const [listaChats, setlistaChats] = useState([]);

    useEffect(() => {
        async function carregaListaApostilas() {
            setLoading(true);
            const resp = await axios.post('/api/apostilas/list', {}, {headers: {
                authorization: localStorage.getItem('h')
            }});
            setlistaChats(resp.data);
            setLoading(false);
        };
        carregaListaApostilas();
    }, []);

    async function handleApostilaChatChange(event) {
        let chat_span = $(event.target)
        let chat_uuid = chat_span.attr('openchat');
        if (chat_uuid != chatAtivo){
            setChatAtivo(chat_uuid)
        }
    
    };

    if (loading){
        return (<p className='flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-800 text-white'><span><FontAwesomeIcon icon={faSpinner} className='animate-spin text-gray-400 text-xl' />Carregando...</span></p>)
    }

    return (
        <>
            {listaChats.map(function(chat){
                return (
                    <Link to="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-white " openchat={chat.uuid} onClick={handleApostilaChatChange}>
                        {isOpen && <span className="truncate" openchat={chat.uuid}>{chat.titulo == null ? ('Nova Apostila') : (chat.titulo)}</span>}
                    </Link>
                )
            })}
        </>
    )
}

export default ListaApostilas