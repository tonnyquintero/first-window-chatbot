const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot')
require("dotenv").config()
const path = require("path")
const fs = require("fs")
const chat = require("./chatgpt")
const { handlerAI } = require('./whisper')

const menuPath = path.join(__dirname, "mensajes", "menu.txt")
const menu = fs.readFileSync(menuPath, "utf8")

const pathConsultas = path.join(__dirname, "mensajes", "promptConsultas.txt")
const promptConsultas = fs.readFileSync(pathConsultas, "utf8")

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
// const MockAdapter = require('@bot-whatsapp/database/mock')
const MongoAdapter = require('@bot-whatsapp/database/mongo')



const flowVoice = addKeyword(EVENTS.VOICE_NOTE).addAnswer ('Procesando nota de voz...', null, async(ctx, ctxFn) => {
    const text = await handlerAI(ctx)
    const prompt = promptConsultas
    const consulta = text
    const answer = await chat(prompt, consulta)
    await ctxFn.flowDynamic(answer.content)

})


// const menuFlow = addKeyword("Menu").addAnswer(
//     menu,
//     { capture: true },
//     async (ctx, { gotoFlow, fallBack, flowDynamic }) => {
//         if (!["1", "2", "3", "0"].includes(ctx.body)) {
//             return fallBack(
//                 "Respuesta no válida, por favor selecciona una de las opciones."
//             );
//         }
//         switch (ctx.body) {
//             case "1":
//                 return gotoFlow(flowMenuRest);
//             case "2":
//                 return gotoFlow(flowReservar);
//             case "3":
//                 return gotoFlow(flowConsultas);
//             case "0":
//                 return await flowDynamic(
//                     "Saliendo... Puedes volver a acceder a este menú escribiendo '*Menu*'"
//                 );
//         }
//     }
// );

const flowConsultas = addKeyword(EVENTS.WELCOME)
    .addAnswer('Hola Bienvenido a tu restaurante 😋', {
        media: 'https://www.sus-medicos.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FmenuRestaurante.2e9ef668.png&w=1080&q=75',
    })
    .addAnswer("En que te podemos ayudar?", { capture: true }, async (ctx, ctxFn) => {
        const prompt = promptConsultas
        const consulta = ctx.body
        const answer = await chat(prompt, consulta)
        await ctxFn.flowDynamic(answer.content)
    })


// const flowPrincipal = addKeyword(['hola', 'ole', 'alo'])
//     .addAnswer('🙌 Hola bienvenido a este *Chatbot*')
//     .addAnswer(
//         [
//             'te comparto los siguientes links de interes sobre el proyecto',
//             '👉 *doc* para ver la documentación',
//             '👉 *gracias*  para ver la lista de videos',
//             '👉 *discord* unirte al discord',
//         ],
//         null,
//         null,
//     )

const main = async () => {
    const adapterDB = new MongoAdapter({
        dbUri: process.env.MONGO_KEY,
        dbName: 'windows-chat-bot-2'
    })
    const adapterFlow = createFlow([flowConsultas, flowVoice])
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb()
}

main()
