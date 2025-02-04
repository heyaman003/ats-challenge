import html2pdf from 'html2pdf.js';
import logo from '@/company-logo.png';

export const generateResumePdf = async (pdfContainer: HTMLElement) => {
  // Clone the original content to restore it later
  const originalContent = pdfContainer.cloneNode(true) as HTMLElement;

  // Insert the header image at the top of the PDF container
  const firstPageHeader = document.createElement('img');
  firstPageHeader.src = logo.src; // Use the imported logo
  firstPageHeader.style.paddingTop = '10px';
  firstPageHeader.style.width = '100%'; // Adjust width as needed
  pdfContainer.insertBefore(firstPageHeader, pdfContainer.firstChild);

  // Dynamically add page breaks based on the container's children heights
  const children = [...pdfContainer.children] as HTMLElement[];
  const maxPageHeight = 1070; // Maximum height for one page
  let currentPageHeight = firstPageHeader.offsetHeight; // Start with the header height

  for (let i = 0; i < children.length; i++) {
    const child = children[i];

    // Check if the element is too big to fit on one page
    if (child.offsetHeight > maxPageHeight - firstPageHeader.offsetHeight) {
      alert(
        'Element too big to fit in one page. Please divide it into smaller paragraphs.'
      );
      pdfContainer.replaceWith(originalContent); // Restore original content
      return;
    }

    // Add a page break if the current content exceeds the max page height
    if (currentPageHeight + child.offsetHeight > maxPageHeight) {
      const pageBreak = document.createElement('div');
      pageBreak.classList.add('html2pdf__page-break');

      // Insert the header image at the top of the new page
      const headerImage = document.createElement('img');
      headerImage.src = logo.src;
      headerImage.style.paddingTop = '10px';
      headerImage.style.width = '100%';

      // Insert the header image and page break before the current child
      pdfContainer.insertBefore(headerImage, child);
      pdfContainer.insertBefore(pageBreak, child);

      // Reset the current page height to the height of the header and current child
      currentPageHeight = firstPageHeader.offsetHeight + child.offsetHeight;
    } else {
      // Add the child's height to the current page height
      currentPageHeight += child.offsetHeight;
    }
  }

  // Generate the PDF
  try {
    await html2pdf()
      .from(pdfContainer)
      .set({
        margin: 10,
        filename: 'resume.pdf',
        enableWebFonts: true, // Ensures web fonts are embedded
        image: { type: 'jpeg', quality: 1 }, // High quality
        html2canvas: {
          scale: 2, // Increase resolution
          useCORS: true,
          letterRendering: true,
          backgroundColor: '#fff', // Ensure white background
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .save();
  } finally {
    // Restore the original content
    // pdfContainer.replaceWith(originalContent);
  }
};