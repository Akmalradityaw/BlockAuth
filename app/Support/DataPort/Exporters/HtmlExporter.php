<?php

namespace App\Support\DataPort\Exporters;

use App\Support\DataPort\Contracts\ExporterInterface;
use Symfony\Component\HttpFoundation\StreamedResponse;

class HtmlExporter implements ExporterInterface
{
    public function stream(string $filename, array $headers, iterable $rows): StreamedResponse
    {
        $fullName = "{$filename}.html";
        $title = ucwords(str_replace(['-', '_'], ' ', $filename));

        return response()->streamDownload(function () use ($title, $headers, $rows) {
            $handle = fopen('php://output', 'w');
            
            $headerHtml = "<!DOCTYPE html><html lang=\"id\"><head><meta charset=\"UTF-8\">"
                . "<title>" . htmlspecialchars($title) . "</title>"
                . "<style>"
                . "body{font-family:ui-sans-serif,system-ui,sans-serif;margin:24px;color:#1E1B4B;background:#FFF;}"
                . "h1{font-size:20px;margin-bottom:4px;color:#1E1B4B;}"
                . "p.sub{font-size:12px;color:#64748B;margin-top:0;margin-bottom:16px;}"
                . "table{width:100%;border-collapse:collapse;font-size:13px;}"
                . "th{background:#1E1B4B;color:#FFF;text-align:left;padding:8px 12px;font-weight:600;}"
                . "td{padding:8px 12px;border-bottom:1px solid #E2E8F0;}"
                . "tr:nth-child(even){background:#F8FAFC;}"
                . "@media print{body{margin:0;} th{background:#1E1B4B !important;color:#FFF !important;}}"
                . "</style></head><body>"
                . "<h1>" . htmlspecialchars($title) . "</h1>"
                . "<p class=\"sub\">Diekspor dari BlockAuth pada " . date('d M Y H:i:s') . "</p>"
                . "<table><thead><tr>";

            foreach ($headers as $h) {
                $headerHtml .= "<th>" . htmlspecialchars($h) . "</th>";
            }
            $headerHtml .= "</tr></thead><tbody>";
            fwrite($handle, $headerHtml);

            foreach ($rows as $row) {
                $rowHtml = "<tr>";
                foreach (array_values((array) $row) as $cell) {
                    $rowHtml .= "<td>" . htmlspecialchars((string) ($cell ?? '')) . "</td>";
                }
                $rowHtml .= "</tr>";
                fwrite($handle, $rowHtml);
            }

            fwrite($handle, "</tbody></table></body></html>");
            fclose($handle);
        }, $fullName, [
            'Content-Type' => 'text/html; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$fullName}\"",
        ]);
    }
}

