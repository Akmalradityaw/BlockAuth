<?php

namespace App\Support\DataPort\Exporters;

use App\Support\DataPort\Contracts\ExporterInterface;
use App\Support\DataPort\FormulaSanitizer;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CsvExporter implements ExporterInterface
{
    public function stream(string $filename, array $headers, iterable $rows): StreamedResponse
    {
        $fullName = "{$filename}.csv";

        return response()->streamDownload(function () use ($headers, $rows) {
            $handle = fopen('php://output', 'w');
            // Byte Order Mark (BOM) UTF-8 agar karakter spesial & Excel Indonesia terbuka sempurna
            fwrite($handle, "\xEF\xBB\xBF");

            fputcsv($handle, FormulaSanitizer::sanitizeRow($headers));

            foreach ($rows as $row) {
                fputcsv($handle, FormulaSanitizer::sanitizeRow(array_values((array) $row)));
            }

            fclose($handle);
        }, $fullName, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$fullName}\"",
        ]);
    }
}

