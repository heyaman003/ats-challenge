import { NextResponse } from 'next/server';
import { writeFile, unlink, readFile, mkdir, readdir } from 'fs/promises';
import * as path from 'path';
import * as cheerio from 'cheerio';
import { Poppler } from 'node-poppler';

export const runtime = 'nodejs';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file || file.type !== 'application/pdf') {
            return NextResponse.json({ error: "Invalid PDF file" }, { status: 400 });
        }

        // Ensure the tmp directory exists
        const tempDir = path.join(process.cwd(), 'tmp');
        // const tempDir = '/tmp'; // Vercel allows writes only to `/tmp`
        try {
            await mkdir(tempDir, { recursive: true });
        } catch (err) {
            console.error("Error creating tmp directory:", err);
            return NextResponse.json({ error: "Failed to create temporary directory" }, { status: 500 });
        }

        const originalName = file.name.split('.pdf')[0];
        // Add a timestamp to ensure unique filenames
        const timestamp = Date.now();
        const tempFilePath = path.join(tempDir, `${originalName}-${timestamp}`);
        // console.log(tempDir, originalName, tempFilePath, "the issue");

        // Write uploaded PDF
        const arrayBuffer = await file.arrayBuffer();
        await writeFile(tempFilePath, Buffer.from(arrayBuffer));

        // Simplified output path: pdffilename.html
        const outputHtmlPath = `${tempFilePath}-html.html`;
        console.log("output is in ", outputHtmlPath);

        // Convert PDF to HTML
        const poppler = new Poppler();
        await poppler.pdfToHtml(tempFilePath, outputHtmlPath, {
            ignoreImages: true,
            singlePage: true,
        });

        // Check if any .html files exist in the tmp directory
        const files = await readdir(tempDir);
        const htmlFiles = files.filter(file => file.endsWith('.html'));

        // If no HTML files found, return an error
        if (htmlFiles.length === 0) {
            return NextResponse.json({ error: "No HTML files found" }, { status: 500 });
        }

        // Read the first HTML file found
        const htmlFilePath = path.join(tempDir, htmlFiles[0]);
        console.log("Reading HTML file:", htmlFilePath);

        // Read generated HTML
        const htmlContent = await readFile(htmlFilePath, 'utf-8');
        const $ = cheerio.load(htmlContent);

        // Extract paragraphs
        let paragraphs: string[] = [];
        $("p").each((_, element) => {
            // console.log("i come here ---")
            if($(element).html()?.trim() !==undefined){
                const html = $(element).html()?.trim()?.toString() || '';
                 paragraphs.push(html);
            }
            
        });
        paragraphs = paragraphs.filter((line) => line.trim().length > 0);
        // Cleanup the PDF and all HTML files in the tmp directory after processing
        const allHtmlFiles = files.filter(file => file.endsWith('.html'));
        await Promise.all([
            unlink(tempFilePath), // Delete the uploaded PDF
            ...allHtmlFiles.map(file => unlink(path.join(tempDir, file))) // Delete all HTML files
        ]);

        return NextResponse.json({ extractedText: paragraphs });

    } catch (error) {
        console.error("Error processing PDF:", error);
        return NextResponse.json({ error: "Failed to process PDF" }, { status: 500 });
    }
}
