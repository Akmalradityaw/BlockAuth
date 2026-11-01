<?php

namespace App\Support\DataPort\Exporters;

use App\Support\DataPort\Contracts\ExporterInterface;
use Symfony\Component\HttpFoundation\StreamedResponse;

class JsonExporter implements ExporterInterface
{
    public function stream(string $filename, array $headers, iterable $rows): StreamedResponse
    {
        $fullName = "{$filename}.json";

        return response()->streamDownload(function () use ($headers, $rows) {
            $handle = fopen('php://output', 'w');
            fwrite($handle, "[\n");

            $first = true;
            foreach ($rows as $row) {
                if (! $first) {
                    fwrite($handle, ",\n");
                }
                $first = false;

                $rowData = array_values((array) $row);
                $assoc = [];
                foreach ($headers as $index => $colName) {
                    $assoc[$colName] = $rowData[$index] ?? null;
                }

                fwrite($handle, '  ' . json_encode($assoc, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
            }

            fwrite($handle, "\n]\n");
            fclose($handle);
        }, $fullName, [
            'Content-Type' => 'application/json; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$fullName}\"",
        ]);
    }
}

