const express=require("express")
const cors=require("cors")
const { connection } = require("./config/db")
const bodyParser = require("body-parser");
const { itemRouter }=require("./routers/post.router.js")



const app=express()
app.use(express.json())
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
app.use(cors())

app.get("/", (req, res) => {
    res.send("Welcome to the home page");
});

app.use("/data",itemRouter)


app.listen(process.env.port,async(req,res)=>{
    try {
        await connection
        console.log("Db is connected")
    } catch (error) {
        console.log("Db is not connected")
    }
    console.log(`server is listening to ${process.env.port}`)
})

