<?php

namespace App\Support\DataPort\Importers;

use App\Support\DataPort\Contracts\ImporterInterface;

class CsvTxtImporter implements ImporterInterface
{
    public function parse(string $filePath): array
    {
        if (! file_exists($filePath)) {
            return [];
        }

        $content = file_get_contents($filePath);
        // Bersihkan UTF-8 BOM jika ada
        $content = preg_replace('/^\xEF\xBB\xBF/', '', $content);

        $lines = preg_split('/\r\n|\r|\n/', trim($content));
        if (empty($lines)) {
            return [];
        }

        // Auto-detect delimiter pada baris pertama (header)
        $firstLine = $lines[0];
        $delimiters = [',', ';', "\t", '|'];
        $delimiter = ',';
        $maxCount = 0;

        foreach ($delimiters as $d) {
            $count = substr_count($firstLine, $d);
            if ($count > $maxCount) {
                $maxCount = $count;
                $delimiter = $d;
            }
        }

        $rows = [];
        $headers = [];

        foreach ($lines as $idx => $line) {
            if (trim($line) === '') {
                continue;
            }

            $fields = str_getcsv($line, $delimiter);

            if ($idx === 0) {
                $headers = array_map(fn ($h) => strtolower(trim(str_replace(["'", '"'], '', $h))), $fields);
                continue;
            }

            $row = [];
            foreach ($headers as $colIdx => $colName) {
                $row[$colName] = isset($fields[$colIdx]) ? trim($fields[$colIdx]) : null;
            }
            $rows[] = $row;
        }

        return $rows;
    }
}

