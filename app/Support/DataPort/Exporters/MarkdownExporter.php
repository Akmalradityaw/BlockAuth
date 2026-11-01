<?php

namespace App\Support\DataPort\Exporters;

use App\Support\DataPort\Contracts\ExporterInterface;
use Symfony\Component\HttpFoundation\StreamedResponse;

class MarkdownExporter implements ExporterInterface
{
    public function stream(string $filename, array $headers, iterable $rows): StreamedResponse
    {
        $fullName = "{$filename}.md";

        return response()->streamDownload(function () use ($headers, $rows) {
            $handle = fopen('php://output', 'w');
            
            // Header baris
            $cleanHeaders = array_map(fn ($h) => str_replace('|', '\\|', trim($h)), $headers);
            fwrite($handle, '| ' . implode(' | ', $cleanHeaders) . " |\n");

            // Divider baris
            $dividers = array_map(fn () => '---', $headers);
            fwrite($handle, '| ' . implode(' | ', $dividers) . " |\n");

            // Data baris
            foreach ($rows as $row) {
                $cells = array_map(function ($val) {
                    $str = str_replace(["\r\n", "\r", "\n"], ' ', (string) ($val ?? ''));
                    return str_replace('|', '\\|', trim($str));
                }, array_values((array) $row));

                fwrite($handle, '| ' . implode(' | ', $cells) . " |\n");
            }

            fclose($handle);
        }, $fullName, [
            'Content-Type' => 'text/markdown; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$fullName}\"",
        ]);
    }
}

