<?php

namespace App\Support\DataPort\Importers;

use App\Support\DataPort\Contracts\ImporterInterface;
use ZipArchive;

class XlsxImporter implements ImporterInterface
{
    public function parse(string $filePath): array
    {
        if (! file_exists($filePath)) {
            return [];
        }

        $zip = new ZipArchive();
        if ($zip->open($filePath) !== true) {
            return [];
        }

        // 1. Baca shared strings jika ada
        $sharedStrings = [];
        $ssXml = $zip->getFromName('xl/sharedStrings.xml');
        if ($ssXml && preg_match_all('/<si\b[^>]*>(.*?)<\/si>/s', $ssXml, $siMatches)) {
            foreach ($siMatches[1] as $si) {
                preg_match_all('/<t\b[^>]*>(.*?)<\/t>/s', $si, $tMatches);
                $sharedStrings[] = html_entity_decode(implode('', $tMatches[1]));
            }
        }

        // 2. Baca sheet1.xml
        $sheetXml = $zip->getFromName('xl/worksheets/sheet1.xml');
        $zip->close();
        if (! $sheetXml) {
            return [];
        }

        $rows = [];
        $headers = [];

        if (preg_match_all('/<row\b[^>]*>(.*?)<\/row>/s', $sheetXml, $rowMatches)) {
            foreach ($rowMatches[1] as $rIdx => $rXml) {
                $cells = [];
                if (preg_match_all('/<c\b([^>]*)>(.*?)<\/c>/s', $rXml, $cMatches)) {
                    foreach ($cMatches[1] as $cIdx => $cAttrs) {
                        $cBody = $cMatches[2][$cIdx];
                        $val = '';

                        if (str_contains($cAttrs, 't="s"') && preg_match('/<v>(.*?)<\/v>/s', $cBody, $vMatch)) {
                            $idx = (int) $vMatch[1];
                            $val = $sharedStrings[$idx] ?? '';
                        } elseif (preg_match('/<t\b[^>]*>(.*?)<\/t>/s', $cBody, $tMatch)) {
                            $val = html_entity_decode($tMatch[1]);
                        } elseif (preg_match('/<v>(.*?)<\/v>/s', $cBody, $vMatch)) {
                            $val = html_entity_decode($vMatch[1]);
                        }

                        $cells[] = trim($val);
                    }
                }

                if ($rIdx === 0) {
                    $headers = array_map('strtolower', $cells);
                } else {
                    $row = [];
                    foreach ($headers as $cIdx => $h) {
                        $row[$h] = $cells[$cIdx] ?? null;
                    }
                    $rows[] = $row;
                }
            }
        }

        return $rows;
    }
}

