<?php

namespace App\Support\DataPort\Importers;

use App\Support\DataPort\Contracts\ImporterInterface;
use ZipArchive;

class DocxHtmlImporter implements ImporterInterface
{
    public function parse(string $filePath): array
    {
        if (! file_exists($filePath)) {
            return [];
        }

        // Cek apakah file merupakan arsip DOCX
        $zip = new ZipArchive();
        if ($zip->open($filePath) === true) {
            $docXml = $zip->getFromName('word/document.xml');
            $zip->close();
            if ($docXml) {
                return self::parseDocxXml($docXml);
            }
        }

        // Fallback: parse sebagai file HTML/Table
        $content = file_get_contents($filePath);
        return self::parseHtmlTable($content);
    }

    protected static function parseDocxXml(string $xml): array
    {
        $rows = [];
        $headers = [];

        if (preg_match_all('/<w:tr[\s>].*?<\/w:tr>/s', $xml, $trMatches)) {
            foreach ($trMatches[0] as $idx => $trXml) {
                $cells = [];
                if (preg_match_all('/<w:tc[\s>].*?<\/w:tc>/s', $trXml, $tcMatches)) {
                    foreach ($tcMatches[0] as $tcXml) {
                        preg_match_all('/<w:t[\s>](.*?)<\/w:t>|<w:t>(.*?)<\/w:t>/s', $tcXml, $tMatches);
                        $text = implode('', array_filter(array_merge($tMatches[1], $tMatches[2])));
                        $cells[] = trim($text);
                    }
                }

                if ($idx === 0) {
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

    protected static function parseHtmlTable(string $html): array
    {
        $rows = [];
        $headers = [];

        if (preg_match_all('/<tr[\s>].*?<\/tr>/is', $html, $trMatches)) {
            foreach ($trMatches[0] as $idx => $trHtml) {
                preg_match_all('/<(?:th|td)[\s>](.*?)<\/(?:th|td)>/is', $trHtml, $cellMatches);
                $cells = array_map(fn ($c) => trim(strip_tags($c)), $cellMatches[1]);

                if ($idx === 0 || empty($headers)) {
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

