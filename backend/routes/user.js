const express = require('express');
const router = express.Router();
const zod = require("zod");
const { User, Account } = require("../db/db"); // Corrected import

const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const { authMiddleware } = require('../middleware/authMiddleware');


const signupBody = zod.object({
    username: zod.string(),
    firstName: zod.string(),
    lastName: zod.string(),
    password: zod.string()
})

router.post("/signup", async (req, res) => {
    console.log(req.body);
    const { success } = signupBody.safeParse(req.body);
    if (!success) {
        return res.status(411).json({
            msg: "Incorrect Input"
        });
    }

    const existingUser = await User.findOne({ username: req.body.username });
    if (existingUser) {
        return res.status(411).json({
            msg: "User already exists"
        });
    }

    try {
        const user = await User.create({
            username: req.body.username,
            password: req.body.password,
            firstName: req.body.firstName,
            lastName: req.body.lastName
        });

        const userId = user._id;

        // Create an account and by default have default value in starting acc
        await Account.create({
            userId,
            balance: 4000
        });

        const token = jwt.sign({ userId }, JWT_SECRET);

        return res.send({
            msg: "User created successfully",
            token: token
        });
    } catch (error) {
        console.error("Error creating user:", error);
        return res.status(500).json({
            msg: "Internal Server Error"
        });
    }
});


const signinBody = zod.object({
    username : zod.string().email(),
    password: zod.string()
})

router.post("/signin", async(req,res) => {
    const { success } = signinBody.safeParse(req.body);

    if(!success){
        return res.status(411).json({
            msg : "Incorrect input"
        })
    }

    const user = await User.findOne({
        username: req.body.username, // Correctly access username from request body
        password: req.body.password
    })

    if (user) {
        const token = jwt.sign({
            userId: user._id
        }, JWT_SECRET);
  
        res.json({
            token: token
        })
        return;
    }

    res.status(411).json({
        msg : "Error while login"
    })

})

const updateBody = zod.object({
    password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional()
})

router.put("/update", authMiddleware,async(req,res) =>{
    const { success } = updateBody.safeParse(req.body);
    if(!success){
        return res.status(411).json({
            msg : "Error while updating information"
        })
    }

    await User.findOneAndUpdate({ _id: req.userId}, req.body);

    res.json({
        msg : "user updated successfully"
    })

})

router.get("/bulk", async (req,res) => {
    const filter = req.query.filter || "";

    const users = await User.find({
        $or: [{
            firstName : {
                "$regex" : filter
            }
        }, {
            lastName : {
                "$regex" : filter
            }
        }]
    })

    res.json({
        user : users.map( user => ({
            username : user.username,
            firstName : user.firstName,
            lastName : user.lastName,
            _id : user._id
        }))
    })
})


module.exports = router;