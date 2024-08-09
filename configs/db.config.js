const mongoose = require('mongoose')

const dbConnection =async()=>{

   const Connecting = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`DataBase connected : ${Connecting.connection.host}`)

 }
module.exports=dbConnection 