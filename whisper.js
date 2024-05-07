// const { downloadMediaMessage } = require('@adiwajshing/baileys');
// const { rejects } = require('assert');
// const { error } = require('console');
// const Configuration = require('openai').Configuration
// const OpenAIApi = require('openai').OpenAIApi
// const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
// const ffmpeg = require('fluent-ffmpeg');
// const fs = require('fs');
// const { resolve } = require('path');
// ffmpeg.setFfmpegPath(ffmpegPath)

// const voiceToText = async (path) => {
//     if (!fs.existsSync(path)) {
//         throw new Error ('No se encuentra el archivo')
//     }
//     try {
//         const configuration = new Configuration({
//             apiKey: "sk-proj-5TbEMYpFzyy0QmwgwPXwT3BlbkFJ05FvwSq9WD9ECMZ5Psob",
//         })
//         const openai = new OpenAIApi(configuration);
//         const resp = await openai.createTranscription(
//             fs.createReadStream(path),
//             'whisper-1'
//         );
//         return resp.data.text;
//     } catch (err) {
//         console.log(err.response);
//         return 'ERROR';
//     }
// };

// const convertTOggMp3 = async (inputStream, outStream) => {
//     return new Promise((resolve, reject) => {
//         ffmpeg(inputStream)
//         .audioQuality(96)
//         .toFormat('mp3')
//         .save(outStream)
//         .on('progress', (p) => null)
//         .on('end', () => {
//             resolve(true)
//         })
//     })
// }

// const handlerAI = async (ctx) => {
//     const buffer = await downloadMediaMessage(ctx, 'buffer')
//     const pathTmpOgg = `${process.cwd()}/tmp/voice-note-${Date.now()}.ogg`;
//     const pathTmpMp3 = `${process.cwd()}/tmp/voice-note-${Date.now()}.mp3`;
//     await fs.writeFileSync(pathTmpOgg, buffer);
//     await convertTOggMp3(pathTmpOgg, pathTmpMp3);
//     const text = await voiceToText(pathTmpMp3);
//     fs.unlink(pathTmpMp3, (error) => {
//         if (error) throw error;
//     });
//     fs.unlink(pathTmpOgg, (error) => {
//         if (error) throw error;
//     });
//     return text;
// };

// module.exports = { handlerAI };

// ----CODIGO DE YOUTUBE ----------

const { downloadMediaMessage } = require("@adiwajshing/baileys");
const { Configuration, OpenAIApi } = require("openai");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
ffmpeg.setFfmpegPath(ffmpegPath);
require('dotenv').config();


const voiceToText = async (path) => {
    if (!fs.existsSync(path)) {
        throw new Error("No se encuentra el archivo");
    }
    try {
        const configuration = new Configuration({
            apiKey: process.env.API_KEY,
            organization: process.env.ORGANIZATION,
        });
        const openai = new OpenAIApi(configuration);
        const resp = await openai.createTranscription(
            fs.createReadStream(path),
            "whisper-1"
        );
        return resp.data.text;
    } catch (err) {
        console.log(err.response);
        return "ERROR";
    }
};

const convertOggMp3 = async (inputStream, outStream) => {
    return new Promise((resolve, reject) => {
        ffmpeg(inputStream)
            .audioQuality(96)
            .toFormat("mp3")
            .save(outStream)
            .on("progress", (p) => null)
            .on("end", () => {
                resolve(true);
            });
    });
};

const handlerAI = async (ctx) => {
    const buffer = await downloadMediaMessage(ctx, "buffer");
    const pathTmpOgg = `${process.cwd()}/tmp/voice-note-${Date.now()}.ogg`;
    const pathTmpMp3 = `${process.cwd()}/tmp/voice-note-${Date.now()}.mp3`;
    await fs.writeFileSync(pathTmpOgg, buffer);
    await convertOggMp3(pathTmpOgg, pathTmpMp3);
    const text = await voiceToText(pathTmpMp3);
    fs.unlink(pathTmpMp3, (error) => {
        if (error) throw error;
    });
    fs.unlink(pathTmpOgg, (error) => {
        if (error) throw error;
    });
    return text;
};

module.exports = { handlerAI };