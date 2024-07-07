import { NextResponse } from "next/server";
export async function POST(req){
    try{
        const { question, context } = await req.json();
        const response = await fetch(
            process.env.MODEL_URL,
            {
                headers: {
                    Authorization: `Bearer ${process.env.ACCESS_KEY}`,
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify({"inputs":{question, context}}),
            }
        );
        const json = await response.json();
        return NextResponse.json(json);
    }catch(e){
        return NextResponse.json({ error: e.message});
    }
}