import type { Types } from "mongoose";
import Question from "../questions/model.js";
import ResponseModel from "../responses/model.js";

export async function computeAnalytics(pollId:string | Types.ObjectId) {
    const questions = await Question.find({poll:pollId}).sort({order:1}).lean();

    const responses = await ResponseModel.find({poll:pollId}).lean();

    const totalResponses = responses.length;

    const authenticatedResponses = responses.filter((response)=> response.respondent,).length;
    
    const anonymousResponses = totalResponses - authenticatedResponses;

    const questionSummaries = questions.map((question)=>{
        const optionCounts = new Map<string,number>();

        for(const option of question.options){
            optionCounts.set(option._id.toString(),0);
        }

        for(const response of responses){
            const answer = response.answers.find((answer)=> answer.question.toString() === question._id.toString(),);

            if(!answer) continue;

            const optionId = answer.selectedOption.toString();

            optionCounts.set(optionId,(optionCounts.get(optionId)??0)+1);

        }

        const totalAnswers = [...optionCounts.values()].reduce(
            (sum,count)=> sum + count,0,
        );

        return {
            questionId: question._id,
            questionText:question.text,
            totalAnswers,
            options:question.options.map((option)=>{
                const count = optionCounts.get(option._id.toString())??0;

                return {
                    optionId: option._id,
                    optionText: option.text,
                    count,
                    percentage:
                        totalAnswers === 0
                            ? 0
                            : Math.round((count / totalAnswers) * 100),
                };
            })
        }
    });


    return {
        totalResponses,
        questions: questionSummaries,
        insights: {
            totalQuestions: questions.length,
            participation: {
                authenticated: {
                    count: authenticatedResponses,
                    percentage:
                        totalResponses === 0
                            ? 0
                            : Math.round(
                                  (authenticatedResponses / totalResponses) *
                                      100,
                              ),
                },
                anonymous: {
                    count: anonymousResponses,
                    percentage:
                        totalResponses === 0
                            ? 0
                            : Math.round(
                                  (anonymousResponses / totalResponses) * 100,
                              ),
                },
            },
        },
        lastUpdated: new Date(),
    };
}
