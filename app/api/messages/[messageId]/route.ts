import { messageService } from "@/src/services/message.service";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from 'zod';

const answerSchema = z.object({
  answer : z.string().min(1 , 'Answer cannot be empty').max(1000),
});

export async function PATCH(
  request : NextRequest,
  {params} :{params :{messageId : string}}
){
  try {
    const {messageId} = params;
    const token = cookies().get('auth_token')?.value;

    if(!token){
      return NextResponse.json({error:'Unauthorized'}  , {status: 401});
    }
    const body = await request.json();
    const {answer}= answerSchema.parse(body);
    // if token matches the message owner
    const updatedMessage = await messageService.answerMessage(messageId , answer , token);
    return NextResponse.json(updatedMessage);
  } catch(error){
    if(error instanceof  ZodError){
      return NextResponse.json({error : 'invalid input' , details : error.errors} , {status: 400});
    }
    if(error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Message not found')){
      return NextResponse.json({error:error.message} , {status : 403});
    }
    console.error('Error updating message answer:', error);
    return NextResponse.json({error: 'Internal Server Error'}, {status: 500});
  }
}
