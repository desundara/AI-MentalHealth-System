import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const generateMoodReport = ({ user, logs, weeklySummary }) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // ── Header ──────────────────────────────────────────────
    doc.setFillColor(22, 163, 74); // verde-600
    doc.rect(0, 0, pageWidth, 36, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('MindCare', 14, 16);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Mental Health Self-Assessment Report', 14, 24);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}`, 14, 31);

    // ── User Info ────────────────────────────────────────────
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Patient Information', 14, 50);

    doc.setDrawColor(22, 163, 74);
    doc.setLineWidth(0.5);
    doc.line(14, 53, pageWidth - 14, 53);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(`Name:   ${user?.full_name || '—'}`, 14, 61);
    doc.text(`Email:  ${user?.email || '—'}`, 14, 68);
    doc.text(`Total Logs:  ${logs.length}`, 14, 75);

    // ── Weekly Summary ───────────────────────────────────────
    if (weeklySummary?.summary?.total_logs > 0) {
        const s = weeklySummary.summary;
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('Weekly Summary (Last 7 Days)', 14, 90);
        doc.line(14, 93, pageWidth - 14, 93);

        const summaryData = [
        ['Average Mood Score', s.avg_mood ? `${parseFloat(s.avg_mood).toFixed(1)} / 10` : '—'],
        ['Average Stress Level', s.avg_stress ? `${parseFloat(s.avg_stress).toFixed(1)} / 10` : '—'],
        ['Average Anxiety Level', s.avg_anxiety ? `${parseFloat(s.avg_anxiety).toFixed(1)} / 10` : '—'],
        ['Average Sleep Hours', s.avg_sleep ? `${parseFloat(s.avg_sleep).toFixed(1)} hrs` : '—'],
        ['Lowest Mood', s.lowest_mood ? `${s.lowest_mood} / 10` : '—'],
        ['Highest Mood', s.highest_mood ? `${s.highest_mood} / 10` : '—'],
        ['Total Logs This Week', s.total_logs],
        ];

        autoTable(doc, {
        startY: 97,
        head: [['Metric', 'Value']],
        body: summaryData,
        theme: 'grid',
        headStyles: { fillColor: [22, 163, 74], textColor: 255, fontStyle: 'bold', fontSize: 10 },
        bodyStyles: { fontSize: 10, textColor: [60, 60, 60] },
        alternateRowStyles: { fillColor: [240, 253, 244] },
        columnStyles: { 0: { fontStyle: 'bold' } },
        margin: { left: 14, right: 14 },
        });
    }

    // ── Mood Log History ─────────────────────────────────────
    const tableStartY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 14 : 100;

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Mood Log History', 14, tableStartY);
    doc.line(14, tableStartY + 3, pageWidth - 14, tableStartY + 3);

    const riskColor = (level) => {
        if (level === 'High') return [220, 38, 38];
        if (level === 'Medium') return [234, 179, 8];
        return [22, 163, 74];
    };

    const tableRows = logs.map(log => [
        new Date(log.log_date).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }),
        `${log.mood_score}/10`,
        log.stress_level ? `${log.stress_level}/10` : '—',
        log.anxiety_level ? `${log.anxiety_level}/10` : '—',
        log.sleep_hours ? `${log.sleep_hours}h` : '—',
        log.risk_level || '—',
        log.symptoms ? log.symptoms.split(',').slice(0,2).join(', ') + (log.symptoms.split(',').length > 2 ? '...' : '') : 'None',
    ]);

    autoTable(doc, {
        startY: tableStartY + 7,
        head: [['Date', 'Mood', 'Stress', 'Anxiety', 'Sleep', 'Risk', 'Symptoms']],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [22, 163, 74], textColor: 255, fontStyle: 'bold', fontSize: 9 },
        bodyStyles: { fontSize: 9, textColor: [60, 60, 60] },
        alternateRowStyles: { fillColor: [240, 253, 244] },
        columnStyles: {
        0: { cellWidth: 28 },
        1: { cellWidth: 18, halign: 'center' },
        2: { cellWidth: 18, halign: 'center' },
        3: { cellWidth: 20, halign: 'center' },
        4: { cellWidth: 18, halign: 'center' },
        5: { cellWidth: 20, halign: 'center' },
        6: { cellWidth: 'auto' },
        },
        didParseCell: (data) => {
        if (data.column.index === 5 && data.section === 'body') {
            const level = data.cell.raw;
            if (level && level !== '—') {
            data.cell.styles.textColor = riskColor(level);
            data.cell.styles.fontStyle = 'bold';
            }
        }
        },
        margin: { left: 14, right: 14 },
    });

    // ── Footer ───────────────────────────────────────────────
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
        'MindCare — Confidential Mental Health Report',
        14,
        doc.internal.pageSize.getHeight() - 8
        );
        doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth - 14,
        doc.internal.pageSize.getHeight() - 8,
        { align: 'right' }
        );
    }

    // ── Save ─────────────────────────────────────────────────
    const fileName = `MindCare_Report_${user?.full_name?.replace(/\s+/g, '_') || 'User'}_${new Date().toISOString().slice(0,10)}.pdf`;
    doc.save(fileName);
};

export default generateMoodReport;