const Joi = require('joi')

function validar_login(req, res, next) {
    // Schema define o que é permitido
    const schema = Joi.object({
        email: Joi.string().email().required(),
        senha: Joi.string().required()
    });

    // Valida o req.body
    const { error, value } = schema.validate(req.body);

    if (error) {
        // Se tiver campo estranho ou tipo errado, retorna erro 400
        return res.status(400).json({ mensagem: error.details[0].message });
    }

    // IMPORTANTE: Substitui o req.body pelo valor validado/limpo
    req.body = value; 
    next();
};

module.exports = validar_login