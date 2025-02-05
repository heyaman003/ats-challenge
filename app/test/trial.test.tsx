
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CVEditor from "../trial/page"; // Adjust the path if needed
import "@testing-library/jest-dom";
import { jest } from "@types/jest";

// Mock dynamic imports for TiptapEditor and AtsChecker so they render simple placeholders.
jest.mock("@/components/ui/tiptap-editor", () => () => (
  <div data-testid="tiptap-editor">Tiptap Editor</div>
));
jest.mock("@/components/function/atscheecker", () => () => (
  <div data-testid="ats-checker">ATS Checker</div>
));

jest.mock("framer-motion", () => {
    return {
      motion: {
        div: React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
          (props, ref) => <div ref={ref} {...props} />
        ),
      },
    };
  });
  
  



describe("CVEditor Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders loading state initially and then main content", async () => {
    render(<CVEditor />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    );

    expect(screen.getByTestId("tiptap-editor")).toBeInTheDocument();
    expect(screen.getByTestId("ats-checker")).toBeInTheDocument();
  });

  test("handles file upload and calls the /api/get-html endpoint", async () => {
    const fakeResponse = { extractedText: "Parsed CV content" };
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(fakeResponse),
      })
    ) as jest.Mock;

    render(<CVEditor />);
    await waitFor(() =>
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    );

    const fileInput = screen.getByRole("textbox", { hidden: true }) as HTMLInputElement;


    // Create a fake file and simulate selecting it.
    const file = new File(["resume content"], "resume.pdf", {
      type: "application/pdf",
    });
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Click the "Parse CV" button
    const parseButton = screen.getByRole("button", { name: /parse cv/i });
    fireEvent.click(parseButton);

    // Wait for the fetch call to be made
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/get-html",
        expect.objectContaining({
          method: "POST",
        })
      );
    });
  });

  test("handles AI submit in modify mode", async () => {
    // Fake API response for modify mode AI request
    const fakeAIResponse = { result: "Modified resume content" };
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(fakeAIResponse),
      })
    ) as jest.Mock;

    render(<CVEditor />);
    await waitFor(() =>
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    );

    // Type into the AI input field.
    const aiInputField = screen.getByPlaceholderText(
      /ask ai to improve the resume/i
    ) as HTMLInputElement;
    fireEvent.change(aiInputField, { target: { value: "Improve grammar" } });

    // Click on the "Modify Resume" button.
    const modifyButton = screen.getByRole("button", { name: /modify resume/i });
    fireEvent.click(modifyButton);

    // Verify that fetch is called with the modify endpoint
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/ai/modify",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })
      );
    });
  });

  test("handles AI submit in chat mode", async () => {
    // Fake API response for chat mode AI request
    const fakeAIResponse = { result: "Chat response content" };
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(fakeAIResponse),
      })
    ) as jest.Mock;

    render(<CVEditor />);
    await waitFor(() =>
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    );

    // Type into the AI input field.
    const aiInputField = screen.getByPlaceholderText(
      /ask ai to improve the resume/i
    ) as HTMLInputElement;
    fireEvent.change(aiInputField, { target: { value: "Career advice" } });

    // Click on the "Career Advice" button.
    const chatButton = screen.getByRole("button", { name: /career advice/i });
    fireEvent.click(chatButton);

    // Verify that fetch is called with the chat endpoint
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/ai/chat",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })
      );
    });
  });
});
