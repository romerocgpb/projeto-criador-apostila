import { useState, useEffect } from 'react';
import ConteudoPrincipal from './ConteudoPrincipal';

import axios from "axios"

function ApostilaManager({chatAtivo}){

    if (chatAtivo == ""){
        return (
            <>
                <h2 className="text-3xl font-semibold mb-4">Pronto pra criar a próxima apostila profissional?</h2>
                <p className="text-center max-w-md text-gray-500">
                    Selecione uma projeto de apostila ou crie uma nova!
                </p>
            </>
        )
    }
    return (
        <>
            <ConteudoPrincipal chatAtivo={chatAtivo}/>
        </>
    )
    


}

export default ApostilaManager