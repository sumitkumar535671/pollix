import ApiError from "../../shared/utils/ApiError.js";
import Question from "../questions/model.js";

type AnswerInput = {
    question:string;
    selectedOption:string;
}

export async function validatePollAnswers(
    pollId:string,
    answers:AnswerInput[],
) {
    const questions = await Question.find({poll:pollId});

    const questionMap = new Map(questions.map((question)=> [question._id.toString(),question]))

    for(const answer of answers){
        const question = questionMap.get(answer.question);

        if(!question) {
            throw ApiError.badRequest("Invalid question in response");
        }

        const optionExists = question.options.some(
            (option)=> option._id.toString()=== answer.selectedOption,
        );

        if(!optionExists){
            throw ApiError.badRequest("Invalid selected option");
        }
    }

    const answeredQuestionIds = new Set(
        answers.map((answer)=>answer.question)
    )

    const missingRequiredQuestion = questions.find(
        (question)=> question.isRequired && !answeredQuestionIds.has(question._id.toString()),
    );

    if(missingRequiredQuestion){
        throw ApiError.badRequest("Please answer all required questions");
    }
}
