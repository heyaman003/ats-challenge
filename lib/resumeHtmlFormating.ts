type Style = { [key: string]: string }; // Example type, modify as needed

function formateToHtml(
   data: { page: number; content: string; styles: Style[] }[]
) {
   const formattedText = data
   .map((item: { content: string }) => {
     return item.content ? `<p>${item.content.trim()}</p>` : ""; // Explicit return
   })
   .join("");
//   const formattedText2 = data
//     .map((item: { content: string }) => `${item.content.trim()}`)
//     .join("");
//   console.log(formattedText, "the data--------");
//   console.log(formattedText2, "the data--------");
  return formattedText;
}
export default formateToHtml;
