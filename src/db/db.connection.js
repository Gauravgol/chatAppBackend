const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URL)
    .then(() => { console.log("MONGO_DB Connedted") })
    .catch((error) => { console.error('There is some error to connect to mongoose: ', error) });
