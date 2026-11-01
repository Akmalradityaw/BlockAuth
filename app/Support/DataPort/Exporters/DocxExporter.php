<?php

namespace App\Support\DataPort\Exporters;

use App\Support\DataPort\Contracts\ExporterInterface;
use Symfony\Component\HttpFoundation\StreamedResponse;
use ZipArchive;

class DocxExporter implements ExporterInterface
{
    public function stream(string $filename, array $headers, iterable $rows): StreamedResponse
    {
        $fullName = "{$filename}.docx";

        return response()->streamDownload(function () use ($filename, $headers, $rows) {
            $tmpFile = tempnam(sys_get_temp_dir(), 'docx');
            $zip = new ZipArchive();
            $zip->open($tmpFile, ZipArchive::CREATE | ZipArchive::OVERWRITE);

            $zip->addFromString('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>');

            $zip->addFromString('_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');

            $xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
            $xml .= '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>';
            $xml .= '<w:p><w:r><w:rPr><w:b/><w:sz w:val="28"/><w:color w:val="1E1B4B"/></w:rPr><w:t>' . htmlspecialchars(ucwords(str_replace(['-', '_'], ' ', $filename))) . '</w:t></w:r></w:p>';
            $xml .= '<w:p><w:r><w:rPr><w:sz w:val="18"/><w:color w:val="64748B"/></w:rPr><w:t>Laporan BlockAuth - ' . date('d M Y H:i:s') . '</w:t></w:r></w:p>';
            $xml .= '<w:tbl><w:tblPr><w:tblBorders><w:top w:val="single" w:sz="4" w:color="CBD5E1"/><w:bottom w:val="single" w:sz="4" w:color="CBD5E1"/><w:insideH w:val="single" w:sz="4" w:color="E2E8F0"/></w:tblBorders></w:tblPr>';

            // Header
            $xml .= '<w:tr><w:trPr><w:tblHeader/></w:trPr>';
            foreach ($headers as $h) {
                $xml .= '<w:tc><w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="1E1B4B"/></w:tcPr><w:p><w:r><w:rPr><w:b/><w:color w:val="FFFFFF"/></w:rPr><w:t>' . htmlspecialchars($h) . '</w:t></w:r></w:p></w:tc>';
            }
            $xml .= '</w:tr>';

            // Rows with 2500 max guard
            $count = 0;
            foreach ($rows as $row) {
                if (++$count > 2500) {
                    break;
                }
                $xml .= '<w:tr>';
                foreach (array_values((array) $row) as $cell) {
                    $xml .= '<w:tc><w:p><w:r><w:t>' . htmlspecialchars((string) ($cell ?? '')) . '</w:t></w:r></w:p></w:tc>';
                }
                $xml .= '</w:tr>';
            }

            $xml .= '</w:tbl>';
            if ($count > 2500) {
                $xml .= '<w:p><w:r><w:t>* Data dipotong pada 2.500 baris untuk efisiensi dokumen.</w:t></w:r></w:p>';
            }
            $xml .= '</w:body></w:document>';

            $zip->addFromString('word/document.xml', $xml);
            $zip->close();

            readfile($tmpFile);
            @unlink($tmpFile);
        }, $fullName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition' => "attachment; filename=\"{$fullName}\"",
        ]);
    }
}

