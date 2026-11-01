<?php

namespace App\Support\DataPort\Importers;

use App\Support\DataPort\Contracts\ImporterInterface;
use InvalidArgumentException;

class SqlInsertImporter implements ImporterInterface
{
    public function parse(string $filePath): array
    {
        if (! file_exists($filePath)) {
            return [];
        }

        $content = file_get_contents($filePath);

        // Keamanan Mutlak: Tolak file yang mengandung instruksi DDL/DML berbahaya
        $forbidden = ['DROP\s+TABLE', 'TRUNCATE', 'ALTER\s+TABLE', 'DELETE\s+FROM', 'GRANT\s+', 'REVOKE\s+'];
        foreach ($forbidden as $pattern) {
            if (preg_match('/' . $pattern . '/i', $content)) {
                throw new InvalidArgumentException("File SQL ditolak: mengandung instruksi berbahaya ({$pattern}).");
            }
        }

        $rows = [];
        // Match: INSERT INTO `table` (`col1`, `col2`) VALUES ('val1', 'val2')
        $pattern = '/INSERT\s+INTO\s+[`"]?[a-zA-Z0-9_]+[`"]?\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\);?/i';

        if (preg_match_all($pattern, $content, $matches, PREG_SET_ORDER)) {
            foreach ($matches as $match) {
                $colsRaw = explode(',', $match[1]);
                $cols = array_map(fn ($c) => strtolower(trim(str_replace(['`', '"', "'", ' '], '', $c))), $colsRaw);

                // Parse values aman dengan str_getcsv
                $vals = str_getcsv($match[2], ',', "'");

                $row = [];
                foreach ($cols as $idx => $colName) {
                    $val = isset($vals[$idx]) ? trim($vals[$idx]) : null;
                    if (strtoupper($val) === 'NULL') {
                        $val = null;
                    }
                    $row[$colName] = $val;
                }
                $rows[] = $row;
            }
        }

        return $rows;
    }
}

