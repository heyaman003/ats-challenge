// app/api/calculate-ats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { calculateATSScore } from "@/lib/atscalculator";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const { cvText, jobDescription } = await request.json();
    console.log(jobDescription,"the desc");
    // Validate input
    if (!cvText || !jobDescription) {
      return NextResponse.json(
        { error: "Missing required parameters: cvText and jobDescription" },
        { status: 400 }
      );
    }

    // Calculate ATS score
    if(Array.isArray(cvText)){
      const score = await calculateATSScore(cvText.toString(), jobDescription);
      // Return score
      console.log(score,"the score is---")
      return NextResponse.json({ score });
    }
    else{
      const score = await calculateATSScore(cvText.toString(), jobDescription);
      // Return score
      console.log(score,"the score is---")
      return NextResponse.json({ score });
    }
    
  } catch (error) {
    console.error("Error calculating ATS score:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}