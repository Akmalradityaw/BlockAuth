<?php

namespace App\Support\DataPort\Exporters;

use App\Support\DataPort\Contracts\ExporterInterface;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PdfExporter implements ExporterInterface
{
    public function stream(string $filename, array $headers, iterable $rows): StreamedResponse
    {
        $fullName = "{$filename}.pdf";
        $title = ucwords(str_replace(['-', '_'], ' ', $filename));

        return response()->streamDownload(function () use ($title, $headers, $rows) {
            echo self::generatePdf($title, $headers, $rows);
        }, $fullName, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => "attachment; filename=\"{$fullName}\"",
        ]);
    }

    protected static function generatePdf(string $title, array $headers, iterable $rows): string
    {
        $pW = 595.28;
        $pH = 841.89;
        $margin = 36;
        $uW = $pW - ($margin * 2);
        $colCount = max(1, count($headers));
        $colWidth = $uW / $colCount;

        $pages = [];
        $stream = '';
        $y = $pH - $margin;

        $initHeader = function (&$s, &$currY) use ($title, $margin, $uW, $headers, $colWidth) {
            $s .= "BT /F1 12 Tf {$margin} " . ($currY - 14) . ' Td (' . self::esc($title) . ") Tj ET\n";
            $s .= "BT /F1 8 Tf {$margin} " . ($currY - 26) . ' Td (Laporan BlockAuth: ' . date('d M Y H:i') . ") Tj ET\n";
            $currY -= 34;

            // Box Header Navy
            $s .= "0.12 0.11 0.29 rg\n{$margin} " . ($currY - 16) . " {$uW} 16 re f\n1 1 1 rg\n";
            foreach ($headers as $idx => $h) {
                $x = $margin + ($idx * $colWidth) + 3;
                $s .= "BT /F1 7 Tf {$x} " . ($currY - 11) . ' Td (' . self::esc(substr($h, 0, 16)) . ") Tj ET\n";
            }
            $s .= "0 0 0 rg\n";
            $currY -= 16;
        };

        $initHeader($stream, $y);
        $count = 0;
        $rowIdx = 0;

        foreach ($rows as $row) {
            if (++$count > 2500) {
                break;
            }
            if ($y < $margin + 20) {
                $pages[] = $stream;
                $stream = '';
                $y = $pH - $margin;
                $initHeader($stream, $y);
            }

            if ($rowIdx % 2 === 1) {
                $stream .= "0.97 0.98 0.99 rg\n{$margin} " . ($y - 14) . " {$uW} 14 re f\n0 0 0 rg\n";
            }
            $stream .= "0.9 0.9 0.9 RG 0.5 w\n{$margin} " . ($y - 14) . " m " . ($margin + $uW) . " " . ($y - 14) . " l S\n";

            foreach (array_values((array) $row) as $idx => $val) {
                if ($idx >= $colCount) {
                    break;
                }
                $x = $margin + ($idx * $colWidth) + 3;
                $txt = self::esc(substr((string) ($val ?? ''), 0, 22));
                $stream .= "BT /F1 7 Tf {$x} " . ($y - 10) . " Td ({$txt}) Tj ET\n";
            }

            $y -= 14;
            $rowIdx++;
        }

        $pages[] = $stream;

        return self::buildPdf($pages, $pW, $pH);
    }

    protected static function esc(string $str): string
    {
        return str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], $str);
    }

    protected static function buildPdf(array $pages, float $w, float $h): string
    {
        $objs = [];
        $objs[1] = '<< /Type /Catalog /Pages 2 0 R >>';
        $objs[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';

        $pageKids = [];
        $nextId = 4;
        foreach ($pages as $pStream) {
            $pId = $nextId++;
            $cId = $nextId++;
            $pageKids[] = "{$pId} 0 R";
            $objs[$pId] = "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {$w} {$h}] /Contents {$cId} 0 R /Resources << /Font << /F1 3 0 R >> >> >>";
            $objs[$cId] = "<< /Length " . strlen($pStream) . " >>\nstream\n{$pStream}\nendstream";
        }

        $objs[2] = '<< /Type /Pages /Kids [' . implode(' ', $pageKids) . '] /Count ' . count($pages) . ' >>';
        ksort($objs);

        $out = "%PDF-1.4\n";
        $offsets = [];
        foreach ($objs as $id => $val) {
            $offsets[$id] = strlen($out);
            $out .= "{$id} 0 obj\n{$val}\nendobj\n";
        }

        $xrefStart = strlen($out);
        $total = max(array_keys($objs)) + 1;
        $out .= "xref\n0 {$total}\n0000000000 65535 f \n";
        for ($i = 1; $i < $total; $i++) {
            $off = $offsets[$i] ?? 0;
            $out .= sprintf("%010d 00000 n \n", $off);
        }

        $out .= "trailer\n<< /Size {$total} /Root 1 0 R >>\nstartxref\n{$xrefStart}\n%%EOF";
        return $out;
    }
}

