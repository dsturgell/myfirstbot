var builder      = require('botbuilder')
var restify      = require('restify')

var connector    = new builder.ChatConnector() 
var bot          = new builder.UniversalBot(connector)

//Luis Setup
var luisEndpoint = "https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/63093baa-8541-40c7-995c-bccea3bf63d2?subscription-key=452b45b79b5b42ec833f886e005212b8&verbose=true&q="
var recognizer   = new builder.LuisRecognizer(luisEndpoint)
var intents      = new builder.IntentDialog({recognizers: [recognizer]})


bot.dialog('/', intents)
    .matches("Greeting", [
        session => {
            session.send("Hi Friend")
        }
    ])
    .matches("MenuInquiry", [
        (session, response) => {
            var entities = extractEntities(session, response)

            entities.forEach( e => {
                session.send("I found an entity: " + e.entity)
            })

            session.send("You want to know about the menu")
        }
    ])
    .matches("None", [
        session => {
            session.send("I don't understand")
        }
    ])
var server = restify.createServer();
server.listen(3978, function() {
    console.log('test bot endpoint at http://localhost:3978/api/messages')
})
server.post('/api/messages', connector.listen())


//Helper functions
const extractEntities = (session, response) => {
    var foundEntities = []
    
    var foodType = builder.EntityRecognizer.findEntity(response.entities, "FoodType")
    var money = builder.EntityRecognizer.findEntity(response.entities, "builtin.money")
    if (foodType) {
        session.userData.foodType = foodType
        foundEntities.push(foodType)
    }
    if (money) {
        session.userData.money = money
        foundEntities.push(money)
    }
    return foundEntities
}