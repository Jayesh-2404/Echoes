import { NextResponse } from "next/server";
import { userService } from "@/src/services/user.service";

export async function POST(){
  try{
    const user = await userService.createUser();
    return NextResponse.json({userId : user.id}, {status :201});

  }catch(error){
    console.log('Error Creating User: ' , error);
    return NextResponse.json({error:'Internal Server Error'} , {status : 500})
  }
}
