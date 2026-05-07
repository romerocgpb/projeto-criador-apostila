const jwt = require('jsonwebtoken');

// Chave secreta (em produção, use variáveis de ambiente!)
const SECRET_KEY = 'É verdade que podemos fazer farinha de milho a partir do feijão. O segredo é o seguinte: pegue um feijão, descasque-o e bata no pilão, e só após jogue o pó no ar. pronto, é tão simples! HIASHDOASJNDKLFMNSP,C.ÁSOCK ,.´POpok,.pdks.; akfpokr';

function gerarToken(usuario) {
    // O payload são os dados do usuário (não coloque senhas aqui!)
    const payload = {
        id: usuario.id,
        email: usuario.email
    };

    // Opções do token
    const options = {
        expiresIn: '7d' // O token expira em 1 hora.
        // Outros exemplos: "7d" (7 dias), "2m" (2 minutos)
    };

    // O método 'sign' cria o token
    const token = jwt.sign(payload, SECRET_KEY, options);
    return token;
}

function verificarToken(tokenRecebido) {
    try {
        // O método 'verify' checa a assinatura E a data de expiração
        const decoded = jwt.verify(tokenRecebido, SECRET_KEY);

        console.log('Token válido!');
        console.log('Dados do usuário:', decoded);
        return decoded;

    } catch (erro) {
        // Aqui tratamos os erros específicos
        
        if (erro.name === 'TokenExpiredError') {
            console.error('Erro: O token expirou em:', erro.expiredAt);
            // Aqui você pode avisar o frontend para pedir login novamente
        } else if (erro.name === 'JsonWebTokenError') {
            console.error('Erro: Token inválido ou adulterado.');
        } else {
            console.error('Erro desconhecido:', erro);
        }
        
        return null;
    }
}

module.exports = {gerarToken, verificarToken}