export class VerifySecurityQuestionDto {
    answers: {
        questionId: string;
        answer: string;
    }[];
}