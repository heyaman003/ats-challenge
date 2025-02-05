import { OpenAI } from "openai";
import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Rate limiting----using Redis
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "60 s"),
  analytics: true,
});

const getClientIdentifier = (req: NextRequest) => {
  const ip = req.headers.get("x-forwarded-for");

  if (process.env.NODE_ENV === "development") {
    return ip?.split(",")[0]?.trim() || "127.0.0.1";
  }

  return (
    ip?.split(",")[0]?.trim() ||
    req.headers.get("cf-connecting-ip") ||
    "unknown"
  );
};

// AnonymizationAgent for securing presnoal info
class AnonymizationAgent {
  private static patterns = {
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    phone: /(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g,
    address:
      /\d+\s+([A-Za-z]+\s)+(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln)\.?/gi,
    name: /(^|\n)\s*(name|full name|contact information)\s*:\s*.*/gi,
    url: /(https?:\/\/[^\s]+)/g,
  };

  static basicAnonymize(text: string): string {
    return text
      .replace(this.patterns.email, "[EMAIL]")
      .replace(this.patterns.phone, "[PHONE]")
      .replace(this.patterns.address, "[ADDRESS]")
      .replace(this.patterns.name, "$1[NAME]")
      .replace(this.patterns.url, "[LINK]");
  }

  static anonymizeStructuredContent(content: any[]): any[] {
    // console.log(content,"the contnet is-----")
    let basicAnonymizationAgent = content.map((page) => ({
      content: this.basicAnonymize(page),
    }));
    // console.log(x,"after chaning---")
    return basicAnonymizationAgent;
  }

  static async deepAnonymize(text: string): Promise<string> {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      messages: [
        {
          role: "system",
          content: `
        see if you can add any [placheloder] fro any missing presonal info required in resume `,
        },
        {
          role: "user",
          content: text,
        },
      ],
    });
    // console.log("ai response", response.choices[0].message);
    return response.choices[0].message.content || text;
  }
}

// class CVProcessingAgent {
//   static cleanContent(text: string): string {
//     return text
//       .replace(/<[^>]*>?/gm, "")
//       .replace(/\n{3,}/g, "\n\n")
//       .replace(/\s{2,}/g, " ")
//       .substring(0, 3000);
//   }
// }

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ mode: string }> }
) {
  try {
    // Rate limiting check
    const identifier = getClientIdentifier(req);
    const { success } = await ratelimit.limit(identifier);

    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again in a minute." },
        { status: 429 }
      );
    }

    // Validate request body
    const { prompt, cvContent } = await req.json();
    if (!prompt || cvContent === undefined || cvContent === null) {
      return NextResponse.json(
        { error: "Missing required fields: prompt or cvContent" },
        { status: 400 }
      );
    }

    const { mode } = await props.params;

    // Process different cvContent types
    let processedContent = "";
    if (typeof cvContent === "string") {
      // Ensure cvContent is a non-empty string
      if (cvContent.trim().length === 0) {
        return NextResponse.json(
          { error: "cvContent cannot be an empty string" },
          { status: 400 }
        );
      }
      processedContent = AnonymizationAgent.basicAnonymize(cvContent);
    } else if (Array.isArray(cvContent)) {

      if (cvContent.length === 0) {
        return NextResponse.json(
          { error: "cvContent cannot be an empty array" },
          { status: 400 }
        );
      }
      // console.log(cvContent[0])
      const anonymizedArray =
        AnonymizationAgent.anonymizeStructuredContent(cvContent);
      processedContent = anonymizedArray.map((page) => page.content).join("\n");
      // console.log(processedContent,"the content")
    } else {
      return NextResponse.json(
        { error: "Invalid CV content format. Expected string or array." },
        { status: 400 }
      );
    }

    const isModifyMode = mode === "modify";
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: isModifyMode ? 0.3 : 0.7,
      max_tokens: isModifyMode ? 2000 : 600,
      messages: [
        {
          role: "system",
          content: isModifyMode
            ? `
            You are an ATS resume expert. Create HTML structure following:
            1. Use semantic HTML with classes: header, section, item-list
            2. see if you can add any [placheloder] fro any missing presonal info required in resume 
            3. Focus on skills, experience, and education
            4. Maintain consistent date formats (MM/YYYY)
            5. Use bullet points for achievements
            6. Output raw HTML without markdown
          `
            : `
            You are a career advisor, see if your provide the resume in the answer them based on resume details. make it short and point to point
          `,
        },
        {
          role: "user",
          content: isModifyMode
            ? `
            Reformatted resume request: ${prompt}
            Anonymized content: ${processedContent}
            Required HTML structure:
            <div class="resume">
              <div class="header">
                <h1>[NAME] <p>(Role)</p></h1>
                <p>[EMAIL]</p>
                <p>[PHONE]</p>
                <p>[Role]</p>
              </div>
              <!-- Content sections -->
            </div>
          `
            : `
            Career advice request: ${prompt}
            Anonymous resume context: ${processedContent}
          `,
        },
      ],
    });
    console.log("ai response", response.choices[0].message);

    return NextResponse.json({
      result: response.choices[0].message?.content || "No response",
      anonymizedPreview: processedContent.substring(0, 200),
    });
  } catch (error) {
    console.error("AI Processing Error:", error);
    return NextResponse.json(
      { error: "Processing failed. Please check your input and try again." },
      { status: 500 }
    );
  }
}
