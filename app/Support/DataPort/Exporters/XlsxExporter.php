<?php

namespace App\Support\DataPort\Exporters;

use App\Support\DataPort\Contracts\ExporterInterface;
use App\Support\DataPort\FormulaSanitizer;
use Symfony\Component\HttpFoundation\StreamedResponse;
use ZipArchive;

class XlsxExporter implements ExporterInterface
{
    public function stream(string $filename, array $headers, iterable $rows): StreamedResponse
    {
        $fullName = "{$filename}.xlsx";

        return response()->streamDownload(function () use ($headers, $rows) {
            $tmpFile = tempnam(sys_get_temp_dir(), 'xlsx');
            $zip = new ZipArchive();
            $zip->open($tmpFile, ZipArchive::CREATE | ZipArchive::OVERWRITE);

            $zip->addFromString('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>');

            $zip->addFromString('_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>');

            $zip->addFromString('xl/_rels/workbook.xml.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>');

            $zip->addFromString('xl/workbook.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheets><sheet name="Data" sheetId="1" r:id="rId1" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/></sheets></workbook>');

            $sheetXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>';

            // Header row
            $sheetXml .= '<row r="1">';
            foreach ($headers as $colIdx => $h) {
                $colLetter = self::getColLetter($colIdx);
                $clean = htmlspecialchars(FormulaSanitizer::sanitize($h), ENT_XML1);
                $sheetXml .= "<c r=\"{$colLetter}1\" t=\"inlineStr\"><is><t>{$clean}</t></is></c>";
            }
            $sheetXml .= '</row>';

            // Data rows (with 2500 max guard)
            $rowIdx = 2;
            foreach ($rows as $row) {
                if ($rowIdx > 2501) {
                    break;
                }
                $sheetXml .= "<row r=\"{$rowIdx}\">";
                foreach (array_values((array) $row) as $colIdx => $cell) {
                    $colLetter = self::getColLetter($colIdx);
                    $clean = htmlspecialchars(FormulaSanitizer::sanitize((string) ($cell ?? '')), ENT_XML1);
                    $sheetXml .= "<c r=\"{$colLetter}{$rowIdx}\" t=\"inlineStr\"><is><t>{$clean}</t></is></c>";
                }
                $sheetXml .= '</row>';
                $rowIdx++;
            }

            $sheetXml .= '</sheetData></worksheet>';
            $zip->addFromString('xl/worksheets/sheet1.xml', $sheetXml);
            $zip->close();

            readfile($tmpFile);
            @unlink($tmpFile);
        }, $fullName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => "attachment; filename=\"{$fullName}\"",
        ]);
    }

    protected static function getColLetter(int $colIndex): string
    {
        $letter = '';
        while ($colIndex >= 0) {
            $letter = chr($colIndex % 26 + 65) . $letter;
            $colIndex = intdiv($colIndex, 26) - 1;
        }
        return $letter;
    }
}

