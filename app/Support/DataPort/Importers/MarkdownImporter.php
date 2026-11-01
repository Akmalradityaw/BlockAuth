<?php

namespace App\Support\DataPort\Importers;

use App\Support\DataPort\Contracts\ImporterInterface;

class MarkdownImporter implements ImporterInterface
{
    public function parse(string $filePath): array
    {
        if (! file_exists($filePath)) {
            return [];
        }

        $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        if (empty($lines)) {
            return [];
        }

        $headers = [];
        $rows = [];

        foreach ($lines as $line) {
            $trimmed = trim($line);
            if (! str_starts_with($trimmed, '|')) {
                continue;
            }

            // Pecah kolom berdasarkan karakter pipe '|'
            $cells = array_map('trim', explode('|', trim($trimmed, '|')));

            // Lewati baris separator markdown seperti |---|---|
            if (isset($cells[0]) && str_starts_with($cells[0], '---')) {
                continue;
            }

            if (empty($headers)) {
                $headers = array_map(fn ($h) => strtolower(trim($h)), $cells);
                continue;
            }

            $row = [];
            foreach ($headers as $idx => $h) {
                $row[$h] = isset($cells[$idx]) ? $cells[$idx] : null;
            }
            $rows[] = $row;
        }

        return $rows;
    }
}

