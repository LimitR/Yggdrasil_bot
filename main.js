const TelegramBot = require('node-telegram-bot-api');
const token = '2006382004:AAHVYQtweFPvpsAfwKrhSL12cyyfW29HXnc'
const bot = new TelegramBot(token, {polling: true})

const maps = new Map()
let user
class User{
    
    constructor(chat_id){
        this.chat_id = chat_id
        this.capcha_number_1 =  Math.floor(Math.random() * 100)
        this.capcha_number_2 =  Math.floor(Math.random() * 100)
        this.summa = this.capcha_number_1 + this.capcha_number_2
    }
    on_capcha(){
        return `${this.capcha_number_1} + ${this.capcha_number_2} = ?`
    }
    capcha(result){
        if(result == this.summa){
            return true
        }else{
            return false
        }
    }
    save(){
        maps.set(this.chat_id, {num: this.summa, iter: 3})
    }
}

bot.setMyCommands(
[{command: '/start', description: 'test'}]
)
bot.onText(/\/start/, async msg =>{
    user = new User(msg.from.id)
    user.save()
    await bot.sendMessage(msg.chat.id, 
`Добро пожаловать, @${msg.from.username} !

пожалуйста, ознакомьтесь с правилами 
https://t.me/Yggdrasil_ru/120586

а также подтвердите, что вы не бот, у вас есть 3 попытки
${user.on_capcha()}
`, {parse_mode: 'HTML', reply_markup:
                                    JSON.stringify({
                                        inline_keyboard: [
                                            [{ text: `${maps.get(msg.from.id).num + 5}`,  callback_data: `check_${maps.get(msg.from.id).num + 5}` },
                                             { text: `${maps.get(msg.from.id).num}`,      callback_data: `check_${maps.get(msg.from.id).num}` },
                                             { text: `${maps.get(msg.from.id).num + 40}`, callback_data: `check_${maps.get(msg.from.id).num + 40}` },
                                             { text: `${maps.get(msg.from.id).num + 67}`, callback_data: `check_${maps.get(msg.from.id).num + 67}` },
                                             { text: `${maps.get(msg.from.id).num + 25}`, callback_data: `check_${maps.get(msg.from.id).num + 25}` },
                                            ]
                                        ]
                                    })
        
    })
})




bot.on('polling_error', async msg =>{
    bot.sendMessage(msg.chat.id, 'ERROR')
})
bot.on('message', async msg =>{
    if(!msg.text.startsWith('/')){
        if(maps.has(msg.from.id)){

       if(maps.get(msg.from.id).num == msg.text){
           bot.sendMessage(msg.chat.id, 'Вы успешно прошли, добро пожаловать')
           maps.delete(msg.from.id)
       }else{
        maps.get(msg.from.id).iter = maps.get(msg.from.id).iter - 1
        bot.deleteMessage(msg.chat.id, msg.message_id)
        if(maps.get(msg.from.id).iter <= 0){
          await bot.banChatMember(chat.id, query.from.id)
        }
        bot.sendMessage(msg.chat.id, 'Неверные данные, осталось попыток ' + maps.get(msg.from.id).iter)
       }
     }
    }
})
bot.on('callback_query', async query =>{
    const  { chat, message_id, text } = query.message
    switch(query.data){
        case `check_${maps.get(query.from.id).num}`:
            bot.sendMessage(chat.id, 'Вы успешно прошли, добро пожаловать')
            maps.delete(query.from.id)
        break
        default:
            maps.get(query.from.id).iter = maps.get(query.from.id).iter - 1
            if(maps.get(query.from.id).iter <= 0){
               await bot.banChatMember(chat.id, query.from.id)
            }else{
              bot.sendMessage(chat.id, 'Неверные данные, осталось попыток ' + maps.get(query.from.id).iter)  
            }
            
        break
    
    }
})

