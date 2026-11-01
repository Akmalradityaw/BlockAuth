<?php

namespace App\Support\DataPort;

use App\Support\DataPort\Contracts\ExporterInterface;
use App\Support\DataPort\Exporters\CsvExporter;
use App\Support\DataPort\Exporters\DocxExporter;
use App\Support\DataPort\Exporters\HtmlExporter;
use App\Support\DataPort\Exporters\JsonExporter;
use App\Support\DataPort\Exporters\MarkdownExporter;
use App\Support\DataPort\Exporters\PdfExporter;
use App\Support\DataPort\Exporters\SqlExporter;
use App\Support\DataPort\Exporters\TxtExporter;
use App\Support\DataPort\Exporters\XlsxExporter;
use InvalidArgumentException;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DataExporterManager
{
    /**
     * Map format ke class driver ekspor.
     */
    protected static array $drivers = [
        'csv' => CsvExporter::class,
        'xlsx' => XlsxExporter::class,
        'pdf' => PdfExporter::class,
        'docx' => DocxExporter::class,
        'json' => JsonExporter::class,
        'sql' => SqlExporter::class,
        'md' => MarkdownExporter::class,
        'html' => HtmlExporter::class,
        'txt' => TxtExporter::class,
    ];

    /**
     * Dapatkan instance driver ekspor berdasarkan format.
     */
    public static function getDriver(string $format): ExporterInterface
    {
        $normalized = strtolower(trim($format));

        if (! isset(self::$drivers[$normalized])) {
            throw new InvalidArgumentException("Format ekspor '{$format}' tidak didukung.");
        }

        $class = self::$drivers[$normalized];
        return new $class();
    }

    /**
     * Helper stream langsung data ke response HTTP.
     */
    public static function stream(string $format, string $filename, array $headers, iterable $rows): StreamedResponse
    {
        return self::getDriver($format)->stream($filename, $headers, $rows);
    }

    /**
     * Dapatkan daftar seluruh format ekspor yang didukung.
     */
    public static function supportedFormats(): array
    {
        return array_keys(self::$drivers);
    }
}

