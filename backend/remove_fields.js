const mongoose = require('mongoose');
const Quiz = require('./models/quizModel');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, {}).then(async () => {
    const result = await Quiz.collection.updateMany({}, {
        $unset: {
            description: "",
            category: "",
            passingScore: "",
            timeLimit: "",
            isDraft: ""
        }
    });
    console.log(result);
    process.exit();
});
