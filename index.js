const { Client } = require('discord.js')
const fetch = require('cross-fetch')
const fs = require('fs')
require('dotenv').config()

const museu_backup_bot = new Client({
    intents: [
        'GuildMessages', 'GuildMembers', 'Guilds', 'GuildVoiceStates', 'GuildMessageReactions', 'DirectMessages', 'MessageContent'
    ]
})

const backupChannelID = '1167156127423795241'
const originalChannelID = '799830997842657290'

museu_backup_bot.on('ready', client => {
    console.log(`${client.user.username} está online`)
})

museu_backup_bot.on('messageCreate', async message => {
    if (message.author.id === museu_backup_bot.application.id) return
    
    const backupChannel = await getChannel(backupChannelID)
    const originalChannel = await getChannel(originalChannelID)
    const attachments = getAttachments(message.attachments)

    if (message.content === "!backup" && message.channelId === backupChannelID) {
        backupAllFiles(originalChannel, backupChannel)
    }

    if (message.channelId === originalChannelID) {
        attachments.forEach(async attachment => {
            const { file, extension, name } = await getFile(attachment)
            saveFile(file, extension, name)
            sendFile(message.author, backupChannel, name, extension)
        })
    }
})

async function getChannel(channelID) {
    const channel = await museu_backup_bot.channels.fetch(channelID)
    return channel
}

function getExtension(path) {
    var r = /\.([^./]+)$/.exec(path);
    return (r && r[1] || '').split('?')[0]
}

function sendFile(author, channel, name, extension) {
    const user = author
    setTimeout(async () => {
        await channel.send({
            content: `Enviado por <@${user.id}>`,
            files: [{
                attachment: `stream/${name}.${extension}`,
                name: `${name}.${extension}`
            }]
        })
    }, 20000)
}

async function getFile(attachment) {
    setTimeout(async () => {
        const { url, name } = attachment
        const file = await fetch(url)
        const extension = getExtension(url)

        return { file, extension, name}
    }, 20000)

}

function saveFile(file, extension, name) {
    setTimeout(() => {
        file.body.pipe(fs.createWriteStream(`stream/${name}.${extension}`))
    }, 20000)
}

async function backupAllFiles(originalFilesChannel, backupChannel) {
    const { messages } = originalFilesChannel
    const messagesCollection = await messages.fetch()
    messagesCollection.forEach(async message => {
        const attachments = getAttachments(message.attachments)
        attachments.forEach(async attachment => {
            const { file, extension, name} = await getFile(attachment)
            saveFile(file, extension, name)
            sendFile(message.author, backupChannel, name, extension)
        })
    })
}

function getAttachments(attach) {
    var attachments = []
    attach.forEach(attachment => {
        attachments.push(attachment)
    })

    return attachments
}
  
museu_backup_bot.login(process.env.MUSEU_BACKUP)