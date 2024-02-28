const express = require("express");
const app = express();
const cors = require("cors");
const PORT = 3000
app.use(cors());
app.use(express.json());

const rootRouter = require("./routes/index");

app.use("/api/v1", rootRouter);



app.listen(3000, () => {
    console.log(`server is running on port ${PORT}`);
});

