import {Schema, model} from 'mongoose';

const mcqAnswerSchema = new Schema({
    questionId: {type: Schema.Types.ObjectId, ref: 'McqQuestion', required: true},
    selectedOptionIndex: {type: Number, required: true}
})

const textAnswerSchema = new Schema({
    questionId: {type: Schema.Types.ObjectId, ref: 'TextQuestion', required: true},
    answerText: {type: String, required: true}
})

const responseSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    questionnaireId: {type: Schema.Types.ObjectId, ref: 'Questionnaire', required: true},
    mcqAnswers: [mcqAnswerSchema],
    textAnswers: [textAnswerSchema],
    submittedAt: {type: Date, default: Date.now}
});

export const Response = model('Response', responseSchema);