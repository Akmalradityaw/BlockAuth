<?php

namespace App\Support\DataPort\Exporters;

use App\Support\DataPort\Contracts\ExporterInterface;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SqlExporter implements ExporterInterface
{
    public function stream(string $filename, array $headers, iterable $rows): StreamedResponse
    {
        $fullName = "{$filename}.sql";
        $tableName = str_starts_with($filename, 'audit') ? 'audit_logs' : 'users';

        return response()->streamDownload(function () use ($headers, $rows, $tableName) {
            $handle = fopen('php://output', 'w');
            fwrite($handle, "-- BlockAuth Data Export\n");
            fwrite($handle, "-- Generated at: " . date('Y-m-d H:i:s') . "\n\n");

            // Format kolom: hilangkan spasi/karakter khusus menjadi snake_case aman
            $escapedCols = array_map(function ($h) {
                $clean = strtolower(preg_replace('/[^a-zA-Z0-9_]/', '_', trim($h)));
                return "`{$clean}`";
            }, $headers);

            $colsList = implode(', ', $escapedCols);

            foreach ($rows as $row) {
                $values = array_map(function ($val) {
                    if ($val === null) {
                        return 'NULL';
                    }
                    $escaped = addslashes((string) $val);
                    return "'{$escaped}'";
                }, array_values((array) $row));

                $valsList = implode(', ', $values);
                fwrite($handle, "INSERT INTO `{$tableName}` ({$colsList}) VALUES ({$valsList});\n");
            }

            fclose($handle);
        }, $fullName, [
            'Content-Type' => 'application/sql; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$fullName}\"",
        ]);
    }
}

