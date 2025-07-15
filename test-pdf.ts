// test-pdf.ts
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

async function generateTestPdf() {
  const outputDir = path.join(process.cwd(), "public", "pdfs");
  const fontPath = path.join(
    process.cwd(),
    "public",
    "fonts",
    "Roboto-VariableFont_wdth,wght.ttf"
  );
  const outputPath = path.join(outputDir, "test.pdf");

  // 1. Créer le dossier si nécessaire
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 2. Créer le document
  const doc = new PDFDocument();
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  // 3. Charger la police custom
  doc.registerFont("Roboto", fontPath);
  doc.font("Roboto");

  // 4. Écrire du texte
  doc.fontSize(18).text("PDF Test avec Roboto", { align: "center" });
  doc.moveDown();
  doc
    .fontSize(12)
    .text(
      "Ceci est un exemple de fichier PDF généré avec PDFKit et une police Google Fonts."
    );

  doc.end();

  // 5. Attendre que l’écriture soit terminée
  await new Promise((resolve) => stream.on("finish", resolve));

  console.log("✅ PDF généré :", outputPath);
}

generateTestPdf().catch((err) => {
  console.error("❌ Erreur lors de la génération du PDF :", err);
});
