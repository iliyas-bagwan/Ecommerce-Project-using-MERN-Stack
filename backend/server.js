
const app = require('./app')
const dotenv = require('dotenv')
const connectDatabase = require('./config/database')

//Handle uncaught exception
process.on("uncaughtException", err => {
    console.log('Error: ', err.message);
    console.log(`Shutting down server due to  Uncaught Exception`);
        process.exit(1);
})


//Config
dotenv.config({path:"backend/config/config.env"})

// Connect to database
connectDatabase()


const server = app.listen(process.env.PORT, () =>{
    console.log(`Server is running on https://localhost:${process.env.PORT}`)
})


// Unhandled Promise Rejections

process.on("unhandledRejection", err=>{
    console.log('Error: ',err.message);
    console.log(`Shutting down server due to unhandled Promise Rejections`);

    server.close(() =>{
        process.exit(1);
    })
})