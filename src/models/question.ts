import {Schema, model} from 'mongoose';

const mcqQuestionSchema = new Schema({
    question: {type: String, required: true},
    options: [{type: String, required: true}],
    correctOptionIndex: {type: Number, required: true}
});

const textQuestionSchema = new Schema({
    question: {type: String, required: true},
});


const questionnaireSchema = new Schema({
    domainId: {type: Schema.Types.ObjectId, ref: 'Domain', required: true},
    mcqQuestions: [{type: Schema.Types.ObjectId, ref: 'McqQuestion'}],
    textQuestions: [{type: Schema.Types.ObjectId, ref: 'TextQuestion'}],
    dueDate: {type: Date, required: true},
});

export const Questionnaire = model('Questionnaire', questionnaireSchema);
export const McqQuestion = model('McqQuestion', mcqQuestionSchema);
export const TextQuestion = model('TextQuestion', textQuestionSchema);