const TelegramBot = require('node-telegram-bot-api');
const token = 'your token'
const bot = new TelegramBot(token, {polling: true})

const maps = new Map()
let user
class User{
    
    constructor(chat_id){
        this.chat_id = chat_id
        this.capcha_number_1 =  Math.floor(Math.random() * 100)
        this.capcha_number_2 =  Math.floor(Math.random() * 100)
        this.capcha_number_3 = this.capcha_number_1 + this.capcha_number_2
    }
    on_capcha(){
        return `${this.capcha_number_1} + ${this.capcha_number_2} = ?`
    }
    capcha(result){
        if(result == this.capcha_number_3){
            return true
        }else{
            return false
        }
    }
    save(){
        maps.set(this.chat_id, {num: this.capcha_number_3, iter: 3})
    }
}

bot.setMyCommands(
[{command: '/start', description: 'test'}]
)


bot.on('new_chat_members', msg =>{
    console.log(msg);
})

bot.on('polling_error', msg =>{
    bot.sendMessage(msg.chat.id, 'ERROR')
})

bot.onText(/\/start/, async msg =>{
    user = new User(msg.chat.id)
    user.save()
    await bot.sendMessage(msg.chat.id, 
`Добро пожаловать, @${msg.chat.username} !

пожалуйста, ознакомьтесь с правилами 
https://t.me/Yggdrasil_ru/120586

а также подтвердите, что вы не бот, у вас есть 3 попытки
${user.on_capcha()}
`, {parse_mode: 'HTML', reply_markup:
                                    JSON.stringify({
                                        inline_keyboard: [
                                            [{ text: `${maps.get(msg.chat.id).num + 5}`, callback_data: `check_${maps.get(msg.chat.id).num + 5}` },
                                             { text: `${maps.get(msg.chat.id).num}`, callback_data: `check_${maps.get(msg.chat.id).num}` },
                                             { text: `${maps.get(msg.chat.id).num + 40}`, callback_data: `check_${maps.get(msg.chat.id).num + 40}` },
                                             { text: `${maps.get(msg.chat.id).num + 67}`, callback_data: `check_${maps.get(msg.chat.id).num + 67}` },
                                             { text: `${maps.get(msg.chat.id).num + 25}`, callback_data: `check_${maps.get(msg.chat.id).num + 25}` },
                                            ]
                                        ]
                                    })
        
    })
})
bot.on('message', async msg =>{
    if(!msg.text.startsWith('/')){
       if(maps.get(msg.chat.id).num == msg.text){
           bot.sendMessage(msg.chat.id, 'Вы успешно прошли, добро пожаловать')
       }else{
        maps.get(msg.chat.id).iter = maps.get(msg.chat.id).iter - 1
        bot.deleteMessage(msg.chat.id, msg.message_id)
        bot.sendMessage(msg.chat.id, 'Неверные данные, осталось попыток ' + maps.get(msg.chat.id).iter)

       }
       if(maps.get(msg.chat.id).iter < 0){
        bot.stopPolling(msg.chat.id)
        }
    }
    
})

bot.on('callback_query', query =>{
    const  { chat, message_id, text } = query.message

    switch(query.data){
        case `check_${maps.get(chat.id).num}`:
            bot.sendMessage(chat.id, 'Вы успешно прошли, добро пожаловать')
        break

        default:
            maps.get(chat.id).iter = maps.get(chat.id).iter - 1
            bot.sendMessage(chat.id, 'Неверные данные, осталось попыток ' + maps.get(chat.id).iter)
        break
    }
})