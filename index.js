const express=require("express")
const data=require("./data.json")
const app=express()
app.use(express.urlencoded({extended: false}));
const {open}=require('sqlite')
const sqlite3=require('sqlite3')
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken');
const path =require('path')
const cors = require("cors");
app.use(cors());
const port = process.env.PORT || 4000;
app.use(express.json());

const dbpath=path.join(__dirname,"database.db")

let db=null;
const initializeDBAndServer=async()=>{
    try {
        db=await open({
            filename:dbpath,
            driver: sqlite3.Database
        });
        app.listen(port,(req,res)=>{
            console.log(db)
        })
    } catch (e) {
        console.log(`DB Server: ${e.message}`);
        process.exit(1);
    }

}

initializeDBAndServer();

app.get("/",(req,res)=>{
    res.send(data)
})
// POST METHOD

app.post("/login",async(req,res)=>{
    try {
        const {userInputName,userInputPassword}=req.body
        // console.log(userInputPassword)
        // const quary=`INSERT INTO login(name,password) VALUES(${req.body.userInputName},${req.body.userInputPassword});`
        // const quary=`SELECT * FROM login`;
        const hashedPassword = await bcrypt.hash(userInputPassword, 10);
        const payload = {
            username: userInputName,
          };
        const jwtToken = jwt.sign(payload, "MY_SECRET_TOKEN");
        const quary= `INSERT INTO 
        login ( name, password,token) 
      VALUES 
        (
          '${userInputName}', 
          '${hashedPassword}',
          '${jwtToken}'
        )`;
        const response=await db.run(quary);
        console.log(response.lastID);
        res.send({id:response.lastID,jwt_token:jwtToken})
        
    } catch (error) {
        res.send({error:error.message})
        
    }


    // if(req.body.name==="" || req.body.password===""){
    //     res.json({error:"Item connot be Add"})
    // }
    // else{
    //     const user={
    //         id:AddCart.length+1,
    //         address:req.body.pincode,
    //         date:req.body.date,
    //         message:req.body.message
    //     }
    //     AddCart.push(user)
    //     // res.json({result:"Success"});
    //     res.json({result:"success"});
    // }
});
