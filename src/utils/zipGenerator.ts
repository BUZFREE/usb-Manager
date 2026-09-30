import JSZip from 'jszip';
import { PYTHON_FILES } from '../data/pythonTemplates';
import { SCRIPT_TEMPLATES } from '../data/scriptTemplates';

export async function generatePythonProjectZip(): Promise<Blob> {
  const zip = new JSZip();

  // Root folder
  const root = zip.folder('WinLockUsb-Python-Suite');
  if (!root) throw new Error('Could not create zip folder');

  // Add all Python files
  for (const file of PYTHON_FILES) {
    root.file(file.filename, file.code);
  }

  // Scripts folder
  const scriptsFolder = root.folder('Scripts');
  for (const script of SCRIPT_TEMPLATES) {
    scriptsFolder?.file(script.name, script.content);
  }

  // Windows batch launchers
  const blockBat = SCRIPT_TEMPLATES.find(s => s.name === 'Bloquer_USB_Immediat.bat')?.content;
  if (blockBat) root.file('Bloquer_USB_Immediat.bat', blockBat);

  const unblockBat = SCRIPT_TEMPLATES.find(s => s.name === 'Debloquer_USB.bat')?.content;
  if (unblockBat) root.file('Debloquer_USB.bat', unblockBat);

  const runCliBat = `@echo off
echo ==============================================================
echo   Lancement de WinLock USB Manager (CLI) en Administrateur
echo ==============================================================
python winlock_cli.py
pause
`;
  root.file('run_cli_admin.bat', runCliBat);

  const runGuiBat = `@echo off
echo ==============================================================
echo   Lancement de WinLock USB GUI (Application Graphique)
echo ==============================================================
python winlock_gui.py
`;
  root.file('run_gui.bat', runGuiBat);

  const compileBat = `@echo off
echo ==============================================================
echo   Compilation vers Exécutable Standalone Windows (.EXE)
echo ==============================================================
python -m pip install -r requirements.txt
python build_exe.py
pause
`;
  root.file('compile_to_exe.bat', compileBat);

  return await zip.generateAsync({ type: 'blob' });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadText(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  downloadBlob(blob, filename);
}
