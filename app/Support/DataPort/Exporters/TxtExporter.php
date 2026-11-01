<?php

namespace App\Support\DataPort\Exporters;

use App\Support\DataPort\Contracts\ExporterInterface;
use App\Support\DataPort\FormulaSanitizer;
use Symfony\Component\HttpFoundation\StreamedResponse;

class TxtExporter implements ExporterInterface
{
    public function stream(string $filename, array $headers, iterable $rows): StreamedResponse
    {
        $fullName = "{$filename}.txt";

        return response()->streamDownload(function () use ($headers, $rows) {
            $handle = fopen('php://output', 'w');

            // Header TSV
            fwrite($handle, implode("\t", FormulaSanitizer::sanitizeRow($headers)) . "\r\n");

            // Data baris
            foreach ($rows as $row) {
                $cells = array_map(function ($val) {
                    $cleaned = str_replace(["\t", "\r", "\n"], ' ', (string) ($val ?? ''));
                    return FormulaSanitizer::sanitize(trim($cleaned));
                }, array_values((array) $row));

                fwrite($handle, implode("\t", $cells) . "\r\n");
            }

            fclose($handle);
        }, $fullName, [
            'Content-Type' => 'text/plain; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$fullName}\"",
        ]);
    }
}

