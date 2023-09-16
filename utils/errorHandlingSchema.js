const baseJoi = require('joi');
const sanitizeHtml = require('sanitize-html')

const extension = (joi)=>({
    type: 'string',
    base: joi.string(),
    messages:{
        'string.escapeHTML':'{{#label}} must not include HTML!'
    },
    rules:{
        escapeHTML:{
            validate(value,helpers){
                const clean = sanitizeHtml(value,{
                    allowedTags:[],
                    allowedAttributes:{},
                });
                if(clean!==value) return helpers.error('string.escapeHTML',{value})
                return clean;
            }
        }
    }
});

const Joi = baseJoi.extend(extension);

module.exports.imagesSchema=Joi.object({
        title: Joi.string().required().escapeHTML(),
        image: Joi.string(),
        description: Joi.string().escapeHTML(),
        deleteImages: Joi.array()
})

module.exports.docsSchema=Joi.object({
    title: Joi.string().required().escapeHTML(),
    image: Joi.string(),
    docs: Joi.string(),
    description: Joi.string().escapeHTML(),
    delete: Joi.array()
})
