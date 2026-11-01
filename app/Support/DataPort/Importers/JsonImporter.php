<?php

namespace App\Support\DataPort\Importers;

use App\Support\DataPort\Contracts\ImporterInterface;

class JsonImporter implements ImporterInterface
{
    public function parse(string $filePath): array
    {
        if (! file_exists($filePath)) {
            return [];
        }

        $content = file_get_contents($filePath);
        $data = json_decode($content, true);

        if (! is_array($data)) {
            return [];
        }

        // Jika JSON berupa objek tunggal, bungkus jadi array
        if (! isset($data[0]) && count($data) > 0) {
            $data = [$data];
        }

        $rows = [];
        foreach ($data as $item) {
            if (! is_array($item)) {
                continue;
            }
            $cleanRow = [];
            foreach ($item as $k => $v) {
                $cleanKey = strtolower(trim($k));
                $cleanRow[$cleanKey] = is_scalar($v) ? (string) $v : json_encode($v);
            }
            $rows[] = $cleanRow;
        }

        return $rows;
    }
}

