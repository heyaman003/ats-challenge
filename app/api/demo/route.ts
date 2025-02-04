import { NextResponse } from "next/server";
import pdfParse from "pdf-parse";

export async function POST(req: Request) {
  try {
    console.log("API /parse-cv hit");

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const data = await pdfParse(Buffer.from(buffer));
    const anonymizedText = anonymizeCV(data.text);

    return NextResponse.json({ text: anonymizedText });
  } catch (error) {
    console.error("Error parsing CV:", error);
    return NextResponse.json({ error: "Failed to parse CV" }, { status: 500 });
  }
}

export async function GET() {
  console.log("API /parse-cv GET hit");
  return NextResponse.json({ message: "GET request successful" });
}

function anonymizeCV(text: string): string {
  return text
    .replace(/\b[A-Za-z]+ [A-Za-z]+\b/g, "[NAME]")
    .replace(/\b\d{10}\b/g, "[PHONE]")
    .replace(/\b[\w.-]+@[\w.-]+\.\w+\b/g, "[EMAIL]");
}
