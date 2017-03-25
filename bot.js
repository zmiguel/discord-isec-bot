const Discord = require('discord.js');
const fs = require('fs')
const Random = require("random-js");
const random = new Random(Random.engines.mt19937().autoSeed());
const bot = new Discord.Client();

const config = require("./config.json");
const datafile = './data.json';

function isMailInFile(array, string){
  var i = 0;
  for (i=0; i<array.users.length; i++){
    if(array.users[0].mail === string){
      return true;
    }
  }
  return false;
}

function isUserInFile(array, string){
  var i = 0;
  for (i=0; i<array.users.length; i++){
    if(array.users[0].id === string){
      return true;
    }
  }
  return false;
}

var cursos = ["Civil", "EGI", "Electromecânica", "Electrotécnica", "Informática", "Mecânica", "Química", "Biomédica", "Biológica", "Bioengenharia"];
var blockedRoles = ["Mod", "A.E.", "Alunos", "Chefe Delas", "Pseudo-Chulo", "bot"];

bot.on("guildMemberAdd", (member) => { //memsagem quando alguem novo entra no servidor
    let guild = member.guild;
    console.log(`${member.user.username} juntou-se a ${guild.name}`);
    guild.defaultChannel.sendMessage(`${member.user.username} juntou-se ao ISEC!`);
    guild.defaultChannel.sendMessage(member.user + ' Usa `.help` para veres todos os comandos, \n\
                                      usa `.curso join <curso>` para definires o teu curso!\n\
                                      `.reg <email_isec>` para te registares!');
});

/*bot.on("presenceUpdate", (oldMember, newMember) => { //adiciona a um canal quando se abre um jogo   //BROKEN AF
  let guild = newMember.guild;
  console.log('=== presenceUpdate ===');

  if(newMember.user.presence.game != null){
    if(oldMember.user.presence.game != null){ //caso o user altere de jogo
      console.log('passou de jogar, a jogar');
      //remover role do jogo anterior
      let lastGame = oldMember.user.presence.game.name;
      console.log(lastGame);
      let lastGameRole = guild.roles.find("name", lastGame);
      if(!lastGameRole) return;
      if(newMember.roles.has(lastGameRole.id)) {
        newMember.removeRole(lastGameRole);
      }
      //adicionar role do jogo novo
      let currentGame = newMember.user.presence.game.name;
      let playGameRole = guild.roles.find("name", currentGame);
      if(!playGameRole) return;
      newMember.addRole(playGameRole);
    } else { //caso o user passe se nao jogar a jogar
      console.log('passou de nao jogar, a jogar');
      let currentGame = newMember.user.presence.game.name;
      console.log(currentGame);
      let playGameRole = guild.roles.find("name", currentGame);
      if(!playGameRole) return;
      newMember.addRole(playGameRole);
    }
  } else if(newMember.user.presence.game === null){
    if(oldMember.user.presence.game != null){ //caso o user passe de jogar a nao jogar
      console.log('passou de jogar, a nao jogar');
      //remover role do jogo anterior
      let lastGame = oldMember.user.presence.game.name;
      console.log(lastGame);
      let lastGameRole = guild.roles.find("name", lastGame);
      if(!lastGameRole) return;
      if(newMember.roles.has(lastGameRole.id)) {
        newMember.removeRole(lastGameRole);
      }
    } else { //caso o user passe se nao jogar a nao jogar
      console.log('passou de nao jogar, a nao jogar');
    }
  }
});*/

bot.on('message', message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(config.prefix)) return;

  let command = message.content.split(" ")[0];
  command = command.slice(config.prefix.length);

  let args = message.content.split(" ").slice(1);
  let argc = args.length;

  //ping-pong
  if (command == "ping"){
    message.channel.sendMessage('PONG!');
  }
  //foo bar
  if (command == "foo"){
    message.channel.sendMessage('bar!');
  }
  //calculadora
  if(command == "add"){
    if(argc === 0){
      message.reply('`.add x y [z]`');
      return;
    }
    let numArray = args.map(n=> parseInt(n));
    let total = numArray.reduce( (p, c) => p+c);
    message.channel.sendMessage(total);
  }
  //diz o que aparece depois do say e apaga a mensagem original
  if(command == "say"){
    if (args.length > 0){
      message.delete();
      message.channel.sendMessage(args.join(" "));
    } else {
      message.reply('`.say [args]`, seu burro!');
    }
  }
  //apaga x memsagens
  if(command == "del"){
    if (argc < 3){
      var msgs;
      if(argc == 0){
        msgs = 2;
      } else {
        msgs = parseInt(args[0]) + 1;
      }
      message.channel.fetchMessages({limit: msgs}).then(message.channel.bulkDelete(msgs));
    }
  }
  //muda o nick proprio ou de @pessoa
  if(command == "nick"){
    if (argc > 0){
      if(message.guild.member(message.mentions.users.first()) != null){
        let newNick = message.content.split(" ").slice(2).join(" ");
        message.guild.member(message.mentions.users.first()).setNickname(newNick);
        message.reply(`Nick de **${message.mentions.users.first().username}** alterado!`);
      } else {
        message.member.setNickname(args.join(" "));
        message.reply('Nickname alterado!');
      }
    } else {
      message.reply('`.nick <nome>`, seu burro!!');
    }
  }
  //muda o jogo actual do bot
  if(command == "game"){
    if (argc > 0){
      if(argc == 1){
        if(args[0] == 'none'){
          message.client.user.setGame();
        } else {
          message.client.user.setGame(args.join(" "));
        }
      } else {
        message.client.user.setGame(args.join(" "));
      }
    } else {
      message.reply('`.game <texto>`, seu burro!!');
    }
  }
  //adicionate aos canais do curso
  if(command == "curso"){
    if(argc === 0){
      message.reply('`.curso <lista/join/leave> <curso>`, seu burro!');
    }
    if(args[0] === 'lista'){
      message.channel.sendMessage('Cursos disponiveis: ' + cursos.join(", "));
    }
    if(args[0] === 'join'){
      let cursoRole = message.guild.roles.find("name",args[1]);
      if(!cursoRole) {
        message.reply('Esse Curso não existe!');
      } else {
        if(message.member.roles.has(cursoRole.id)){
          message.reply('Já estás nesse curso!');
          return;
        }
        message.member.addRole(cursoRole);
        message.reply('Foste adicionado!');
      }
    }
    if(args[0] == 'leave'){
      message.reply('Não podes andar a entrar e sair de cursos ao calhas! Envia mensagem a um moderador para ele te tirar do curso actual! Podes usar `@Mod`');
      /*let cursoRole = message.guild.roles.find("name",args[1]);
      if(!cursoRole) {
        message.reply('Esse Curso nao existe!');
      } else {
        if(!message.member.roles.has(cursoRole.id)){
          message.reply('Não estás nesse curso!');
          return;
        }
        message.member.removeRole(cursoRole);
        message.reply('Foste removido!');
      }*/
    }
  }
  //adicionate a outros canais
  if(command == "canal"){
    if(argc == 0){
      message.reply('`.canal <join/leave> <nome>`, seu burro!');
    }
    if(args[0] == 'lista'){
      //message.channel.sendMessage('Cursos disponiveis: ' + cursos.join(", "));
    }
    if(args[0] == 'join'){
      if((cursos.indexOf(message.content.split(" ").slice(2).join(" ")) > -1) || blockedRoles.indexOf(message.content.split(" ").slice(2).join(" ")) > -1){
        message.reply("Bloqueado");
        return;
      }
      let canalRole = message.guild.roles.find("name",args[1]);
      if(!canalRole) {
        message.reply('Esse canal não existe!');
      } else {
        if(message.member.roles.has(canalRole.id)){
          message.reply('Já estás nesse canal!');
          return;
        }
        message.member.addRole(canalRole);
        message.reply('Foste adicionado!');
      }
    }
    if(args[0] == 'leave'){
      if((cursos.indexOf(message.content.split(" ").slice(2).join(" ")) > -1) || blockedRoles.indexOf(message.content.split(" ").slice(2).join(" ")) > -1){
        message.reply("Bloqueado");
        return;
      }
      let canalRole = message.guild.roles.find("name",args[1]);
      if(!canalRole) {
        message.reply('Esse canal nao existe!');
      } else {
        if(!message.member.roles.has(canalRole.id)){
          message.reply('Não estás nesse canal!');
          return;
        }
        message.member.removeRole(canalRole);
        message.reply('Foste removido!');
      }
    }
  }
  //regista o ID do utilizar e associa-o a um email do isec
  if(command == "reg"){
    if(argc != 1){
      message.reply('`.reg <email_isec>`, seu burro!');
    } else {
      let mail = args[0].split("@").slice(1);
      let regRole = message.guild.roles.find("name","Alunos");
      let userID = message.author.id;
      let userName = message.author.username;
      if(args[0].startsWith('a')){
        if(mail[0] === 'isec.pt'){
          fs.readFile(datafile, 'utf-8', function(err, data){
            if (err) throw err;
            var userArray = JSON.parse(data);

            if(isMailInFile(userArray, args[0])){
              message.reply('mail já registado!');
              return;
            } else if(isUserInFile(userArray, userID)){
              message.reply('user já registado!');
              return;
            } else if(message.member.roles.has(regRole.id)){
              message.reply('Já estás registado!');
              return;
            } else {
              userArray.users.push({
                user: userName,
                id: userID,
                mail: args[0]
              });
              fs.writeFile(datafile, JSON.stringify(userArray), 'utf-8', function(err){
                if (err) throw err;
                console.log('Ficheiro guardado!');
              });
              message.member.addRole(regRole);
              message.reply('Foste registado!');
              console.log(`${userName}#${userID} (${args[0]}), registou-se @ ${message.guild.name}`);
            }
          });
        } else {
          message.reply('email inválido!');
        }
      } else {
        message.reply('email inválido!');
      }
    }
  }
  //mostra o que os comando fazem e cenas
  if (command == "help"){
    message.reply('\n\
                  `.ping` responde PONG \n\
                  `.foo` responde bar \n\
                  `.add x y [z]` adiciona os numeros (min 2) \n\
                  `.say <frase>` faz com que o bot diga <frase> \n\
                  `.del x` manda apagar x linhas de texto \n\
                  `.nick <nome>` **OU** `.nick @alguem <nome>` permite alterar o teu nick ou de outra pessoa \n\
                  `.game <x>` faz o bot mostrar que está a jogar <x> \n\
                  `.curso <lista/join> <curso>` cenas para te juntares aos chats do teu curso \n\
                  `.canal <join/leave> <nome>` permite-te juntares-te ao canal com nome x \n\
                  `.reg <email_isec>` permite-te fazer o registo no servidor \n\
                  `.roll <numero>` atira um dado de valor X e ve o que sai\n\
                  `.help` este comando, seu burro! ');
  }
  //roll dice
  if (command == "roll"){
    if(argc === 1){
      let rndNum = random.integer(1, parseInt(args[0]));
      message.channel.sendMessage(`lançaste o dado e saiu..... **${rndNum}**!`);
    } else {
      message.reply('`.roll <numero>`, seu burro!');
    }

  }

});

bot.on('ready', () => {
  bot.user.setGame('com a tua mãe');
  console.log('Online!!');
});

bot.login(config.token);
