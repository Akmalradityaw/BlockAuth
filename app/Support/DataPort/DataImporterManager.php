<?php

namespace App\Support\DataPort;

use App\Support\DataPort\Contracts\ImporterInterface;
use App\Support\DataPort\Importers\CsvTxtImporter;
use App\Support\DataPort\Importers\DocxHtmlImporter;
use App\Support\DataPort\Importers\JsonImporter;
use App\Support\DataPort\Importers\MarkdownImporter;
use App\Support\DataPort\Importers\SqlInsertImporter;
use App\Support\DataPort\Importers\XlsxImporter;
use InvalidArgumentException;

class DataImporterManager
{
    protected static array $drivers = [
        'csv' => CsvTxtImporter::class,
        'txt' => CsvTxtImporter::class,
        'json' => JsonImporter::class,
        'sql' => SqlInsertImporter::class,
        'md' => MarkdownImporter::class,
        'docx' => DocxHtmlImporter::class,
        'html' => DocxHtmlImporter::class,
        'htm' => DocxHtmlImporter::class,
        'xlsx' => XlsxImporter::class,
    ];

    public static function getDriver(string $extension): ImporterInterface
    {
        $ext = strtolower(trim($extension));

        if (! isset(self::$drivers[$ext])) {
            throw new InvalidArgumentException("Format berkas impor '.{$extension}' tidak didukung.");
        }

        $class = self::$drivers[$ext];
        return new $class();
    }

    public static function parseFile(string $filePath, ?string $extension = null): array
    {
        $ext = $extension ?: pathinfo($filePath, PATHINFO_EXTENSION);
        return self::getDriver($ext)->parse($filePath);
    }

    public static function supportedExtensions(): array
    {
        return array_unique(array_keys(self::$drivers));
    }
}

