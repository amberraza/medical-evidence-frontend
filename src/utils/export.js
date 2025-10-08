import { jsPDF } from 'jspdf';

// Format conversation as plain text
const formatConversationAsText = (messages) => {
  let text = 'MEDICAL EVIDENCE SEARCH - CONVERSATION EXPORT\n';
  text += '='.repeat(60) + '\n';
  text += `Exported: ${new Date().toLocaleString()}\n`;
  text += '='.repeat(60) + '\n\n';

  messages.forEach((msg, idx) => {
    if (msg.role === 'user') {
      text += `QUESTION ${Math.floor(idx / 2) + 1}:\n`;
      text += msg.content + '\n\n';
    } else {
      text += `ANSWER:\n`;
      text += msg.content + '\n\n';

      if (msg.sources && msg.sources.length > 0) {
        text += 'SOURCES:\n';
        msg.sources.forEach((source, i) => {
          text += `[${i + 1}] ${source.title}\n`;
          text += `    Authors: ${source.authors}\n`;
          text += `    Journal: ${source.journal}, ${source.pubdate}\n`;
          text += `    PMID: ${source.pmid}\n`;
          text += `    URL: ${source.url}\n`;
          if (source.studyType) text += `    Study Type: ${source.studyType}\n`;
          text += '\n';
        });
      }

      text += '-'.repeat(60) + '\n\n';
    }
  });

  text += '\n\nDISCLAIMER:\n';
  text += 'This is a prototype for educational purposes only.\n';
  text += 'Not intended for clinical decision-making.\n';
  text += 'Always consult with qualified healthcare professionals.\n';

  return text;
};

// Download conversation as text file
export const downloadAsText = (messages) => {
  const text = formatConversationAsText(messages);
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `medical-evidence-${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Download conversation as PDF
export const downloadAsPDF = (messages) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const maxWidth = pageWidth - 2 * margin;
  let yPosition = 20;

  // Helper function to add new page if needed
  const checkPageBreak = (heightNeeded) => {
    if (yPosition + heightNeeded > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
      return true;
    }
    return false;
  };

  // Helper function to wrap text
  const addWrappedText = (text, x, y, maxWidth, fontSize, fontStyle = 'normal') => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', fontStyle);
    const lines = doc.splitTextToSize(text, maxWidth);

    lines.forEach((line, index) => {
      checkPageBreak(fontSize * 0.5);
      doc.text(line, x, y + (index * fontSize * 0.5));
    });

    return lines.length * fontSize * 0.5;
  };

  // Header
  doc.setFillColor(79, 70, 229); // Indigo
  doc.rect(0, 0, pageWidth, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Medical Evidence Search', margin, 15);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Conversation Export - ${new Date().toLocaleString()}`, margin, 25);

  yPosition = 45;
  doc.setTextColor(0, 0, 0);

  // Content
  messages.forEach((msg, idx) => {
    if (msg.role === 'user') {
      checkPageBreak(20);

      // Question box
      doc.setFillColor(79, 70, 229);
      doc.setDrawColor(79, 70, 229);
      const questionText = `Q${Math.floor(idx / 2) + 1}: ${msg.content}`;
      const lines = doc.splitTextToSize(questionText, maxWidth - 4);
      const boxHeight = lines.length * 5 + 4;

      doc.roundedRect(margin, yPosition, maxWidth, boxHeight, 2, 2, 'FD');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');

      lines.forEach((line, i) => {
        doc.text(line, margin + 2, yPosition + 5 + (i * 5));
      });

      yPosition += boxHeight + 5;
      doc.setTextColor(0, 0, 0);

    } else {
      checkPageBreak(15);

      // Answer
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const answerHeight = addWrappedText(msg.content, margin, yPosition, maxWidth, 10);
      yPosition += answerHeight + 5;

      // Sources
      if (msg.sources && msg.sources.length > 0) {
        checkPageBreak(15);

        doc.setDrawColor(226, 232, 240);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 5;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(79, 70, 229);
        doc.text(`SOURCES (${msg.sources.length})`, margin, yPosition);
        yPosition += 7;
        doc.setTextColor(0, 0, 0);

        msg.sources.forEach((source, i) => {
          const sourceHeight = 25 + (source.studyType ? 5 : 0);
          checkPageBreak(sourceHeight);

          // Source box
          doc.setFillColor(248, 250, 252);
          doc.setDrawColor(79, 70, 229);
          doc.setLineWidth(0.5);
          doc.rect(margin, yPosition, maxWidth, sourceHeight, 'FD');

          // Source number and title
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(79, 70, 229);
          const titleLines = doc.splitTextToSize(`[${i + 1}] ${source.title}`, maxWidth - 4);
          titleLines.forEach((line, idx) => {
            doc.text(line, margin + 2, yPosition + 5 + (idx * 4));
          });

          let sourceYPos = yPosition + 5 + (titleLines.length * 4) + 2;

          // Metadata
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(100, 116, 139);
          doc.text(source.authors.substring(0, 80), margin + 2, sourceYPos);
          sourceYPos += 4;
          doc.text(`${source.journal}, ${source.pubdate}`, margin + 2, sourceYPos);
          sourceYPos += 4;
          doc.text(`PMID: ${source.pmid}`, margin + 2, sourceYPos);

          // Study type badge
          if (source.studyType) {
            sourceYPos += 5;
            const badgeColor = source.studyType === 'Meta-Analysis' || source.studyType === 'Systematic Review'
              ? [124, 58, 237]
              : source.studyType === 'RCT'
              ? [5, 150, 105]
              : [37, 99, 235];

            doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(7);
            doc.setFont('helvetica', 'bold');
            const badgeWidth = doc.getTextWidth(source.studyType) + 4;
            doc.roundedRect(margin + 2, sourceYPos - 2.5, badgeWidth, 4, 1, 1, 'F');
            doc.text(source.studyType, margin + 4, sourceYPos);
          }

          yPosition += sourceHeight + 3;
          doc.setTextColor(0, 0, 0);
        });
      }

      yPosition += 5;
    }
  });

  // Disclaimer
  checkPageBreak(20);
  doc.setFillColor(254, 243, 199);
  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(1);
  doc.rect(margin, yPosition, maxWidth, 18, 'FD');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(146, 64, 14);
  doc.text('DISCLAIMER:', margin + 2, yPosition + 5);
  doc.setFont('helvetica', 'normal');
  const disclaimerLines = doc.splitTextToSize(
    'This is a prototype for educational purposes only. Not intended for clinical decision-making. Always consult with qualified healthcare professionals.',
    maxWidth - 4
  );
  disclaimerLines.forEach((line, i) => {
    doc.text(line, margin + 2, yPosition + 10 + (i * 4));
  });

  // Save
  doc.save(`medical-evidence-${Date.now()}.pdf`);
};
