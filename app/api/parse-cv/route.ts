import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
import { writeFile, unlink, readFile } from 'fs/promises';

export const runtime = 'nodejs';

export async function POST(req: Request) {
    console.log('POST request received');
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file || file.type !== 'application/pdf') {
            return NextResponse.json({ error: "Invalid PDF file" }, { status: 400 });
        }

        console.log('File received:', file.name);

        // Save the uploaded file temporarily
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const tempFilePath = path.join('/tmp', file.name); // Linux/MacOS Temp Path

        await writeFile(tempFilePath, buffer);

        // Define the output HTML file path
        const outputFilePath = tempFilePath.replace('.pdf', '.html');

        // Run pdf2htmlEX CLI command
        await new Promise((resolve, reject) => {
            exec(`pdf2htmlEX --zoom 1.3 ${tempFilePath} ${outputFilePath}`, (error, stdout, stderr) => {
                if (error) {
                    console.error("Conversion Error:", stderr);
                    reject(error);
                } else {
                    console.log("Conversion Successful:", stdout);
                    resolve(stdout);
                }
            });
        });

        // Read the converted HTML file
        const htmlContent = await readFile(outputFilePath, "utf-8");

        // Clean up temporary files
        await unlink(tempFilePath);
        await unlink(outputFilePath);
        // console.log(htmlContent,"the content is ")
        return new NextResponse(htmlContent, {
            headers: { "Content-Type": "text/html" }
        });

    } catch (error) {
        console.error("Error processing PDF:", error);
        return NextResponse.json({ error: "Failed to process PDF" }, { status: 500 });
    }
}
