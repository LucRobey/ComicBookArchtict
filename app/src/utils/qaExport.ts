/**
 * Exports a QA report markdown file for a given phase.
 * The file is written to qa/[phase_name]/qa_report_[TIMESTAMP].md
 */
export async function exportQaReport(params: {
  phase: string;          // e.g. "3" or "2" or "15" (for phase 1)
  phaseFolder: string;    // e.g. "script", "structure", "pacing" — name of subfolder under qa/
  content: string;        // Full markdown content of the report
}): Promise<{ success: boolean; path?: string; error?: string }> {
  const { phase, phaseFolder, content } = params;
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `qa_report_phase${phase}_${timestamp}.md`;
  const filePath = `qa/${phaseFolder}/${filename}`;

  try {
    const res = await fetch('/api/save-qa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: filePath, content }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Export failed');
    return { success: true, path: filePath };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Builds a QA report header string.
 */
export function buildQaHeader(phaseName: string): string {
  const now = new Date().toISOString();
  return `# QA Report — ${phaseName}\nGenerated: ${now}\n\n`;
}
